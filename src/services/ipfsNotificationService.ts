import { NotificationData, CreateNotificationParams, NotificationSettings } from '@/types/notifications';
import { socialIPFSService } from './socialIPFSService';
import { profileStorage } from '@/utils/profileStorage';
import { SongInteraction } from '@/types/music';

import { CONTRACT_ADDRESSES } from '@/config/web3';
import { HIBEATS_PROFILE_ABI } from '@/contracts/HiBeatsProfileABI';
import { createPublicClient, http } from 'viem';

// Create a public client for reading from smart contract
const publicClient = createPublicClient({
  chain: {
    id: 50312,
    name: 'Somnia Testnet',
    nativeCurrency: { decimals: 18, name: 'STT', symbol: 'STT' },
    rpcUrls: { default: { http: ['https://dream-rpc.somnia.network'] } }
  },
  transport: http('https://dream-rpc.somnia.network')
});

class BlockchainFollowService {
  // Read followers from smart contract events with chunked queries
  async getFollowers(userAddress: string): Promise<string[]> {
    try {
      console.log('📖 Reading followers from smart contract events for:', userAddress);

      // Get current block number
      const currentBlock = await publicClient.getBlockNumber();
      console.log('🔢 Current block:', currentBlock);

      // Strategy: Query recent blocks for new events, merge with localStorage data
      // This ensures we get new blockchain events while keeping historical data
      const BLOCK_RANGE_LIMIT = 500n; // Conservative limit to avoid RPC errors
      const fromBlock = currentBlock > BLOCK_RANGE_LIMIT ? currentBlock - BLOCK_RANGE_LIMIT : 0n;
      console.log('📊 Querying from block:', fromBlock, 'to:', currentBlock, '(recent', BLOCK_RANGE_LIMIT, 'blocks)');

      // Get UserFollowed events where this user was followed
      const followedEvents = await publicClient.getLogs({
        address: CONTRACT_ADDRESSES.HIBEATS_PROFILE,
        event: {
          type: 'event',
          name: 'UserFollowed',
          inputs: [
            { name: 'follower', type: 'address', indexed: true },
            { name: 'following', type: 'address', indexed: true }
          ]
        },
        args: {
          following: userAddress as `0x${string}`
        },
        fromBlock,
        toBlock: currentBlock
      });

      // Get UserUnfollowed events to exclude unfollowed users
      const unfollowedEvents = await publicClient.getLogs({
        address: CONTRACT_ADDRESSES.HIBEATS_PROFILE,
        event: {
          type: 'event',
          name: 'UserUnfollowed',
          inputs: [
            { name: 'follower', type: 'address', indexed: true },
            { name: 'following', type: 'address', indexed: true }
          ]
        },
        args: {
          following: userAddress as `0x${string}`
        },
        fromBlock,
        toBlock: currentBlock
      });

      // Process events to get current followers
      const followersMap = new Map<string, boolean>();

      // Add all followers
      followedEvents.forEach((event: any) => {
        const followerAddress = event.args?.follower;
        if (followerAddress) {
          followersMap.set(followerAddress.toLowerCase(), true);
        }
      });

      // Remove unfollowed users
      unfollowedEvents.forEach((event: any) => {
        const followerAddress = event.args?.follower;
        if (followerAddress) {
          followersMap.delete(followerAddress.toLowerCase());
        }
      });

      const blockchainFollowers = Array.from(followersMap.keys());
      console.log('👥 Found blockchain followers (recent):', blockchainFollowers.length);

      // Merge with localStorage data to get complete picture
      const localStorageFollowers = profileStorage.getFollowers(userAddress);
      console.log('💾 Found localStorage followers:', localStorageFollowers.length);

      // Combine and deduplicate
      const allFollowers = new Set([...blockchainFollowers, ...localStorageFollowers]);
      const finalFollowers = Array.from(allFollowers);
      console.log('🔄 Combined followers:', finalFollowers.length);

      return finalFollowers;
    } catch (error) {
      console.error('❌ Error reading followers from smart contract:', error);
      console.log('🔄 Falling back to localStorage...');
      // Fallback to localStorage if smart contract call fails
      return profileStorage.getFollowers(userAddress);
    }
  }

  async getFollowRelationships() {
    try {
      console.log('📖 Getting follow relationships from smart contract events...');

      // Get current block number
      const currentBlock = await publicClient.getBlockNumber();

      // Query only recent blocks (last 500 blocks max to avoid RPC limit)
      const BLOCK_RANGE_LIMIT = 500n;
      const fromBlock = currentBlock > BLOCK_RANGE_LIMIT ? currentBlock - BLOCK_RANGE_LIMIT : 0n;
      console.log('📊 Querying relationships from block:', fromBlock, 'to:', currentBlock);

      // Get all UserFollowed events
      const followedEvents = await publicClient.getLogs({
        address: CONTRACT_ADDRESSES.HIBEATS_PROFILE,
        event: {
          type: 'event',
          name: 'UserFollowed',
          inputs: [
            { name: 'follower', type: 'address', indexed: true },
            { name: 'following', type: 'address', indexed: true }
          ]
        },
        fromBlock,
        toBlock: currentBlock
      });

      // Get all UserUnfollowed events
      const unfollowedEvents = await publicClient.getLogs({
        address: CONTRACT_ADDRESSES.HIBEATS_PROFILE,
        event: {
          type: 'event',
          name: 'UserUnfollowed',
          inputs: [
            { name: 'follower', type: 'address', indexed: true },
            { name: 'following', type: 'address', indexed: true }
          ]
        },
        fromBlock,
        toBlock: currentBlock
      });

      // Build relationships map
      const relationships = new Map<string, any>();

      // Process follow events
      for (const event of followedEvents) {
        const follower = event.args?.follower;
        const following = event.args?.following;
        if (follower && following) {
          const key = `${follower}_${following}`;
          const block = await publicClient.getBlock({ blockNumber: event.blockNumber });
          relationships.set(key, {
            follower: follower.toLowerCase(),
            following: following.toLowerCase(),
            timestamp: new Date(Number(block.timestamp) * 1000).toISOString()
          });
        }
      }

      // Remove unfollowed relationships
      for (const event of unfollowedEvents) {
        const follower = event.args?.follower;
        const following = event.args?.following;
        if (follower && following) {
          const key = `${follower}_${following}`;
          relationships.delete(key);
        }
      }

      const activeRelationships = Array.from(relationships.values());
      console.log('🔗 Found active follow relationships:', activeRelationships.length);

      return activeRelationships;
    } catch (error) {
      console.error('❌ Error getting follow relationships from smart contract:', error);
      console.log('🔄 Falling back to localStorage...');
      return profileStorage.getFollowRelationships();
    }
  }


  async getProfile(address: string) {
    try {
      console.log('📖 Reading profile from smart contract for:', address);

      // Try to get profile from smart contract
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.HIBEATS_PROFILE,
        abi: HIBEATS_PROFILE_ABI,
        functionName: 'getProfile',
        args: [address as `0x${string}`]
      }) as any;

      if (result && result.username) {
        return {
          address,
          username: result.username,
          displayName: result.displayName,
          bio: result.bio,
          avatar: result.avatar,
          // ... other profile fields
        };
      }
    } catch (error) {
      console.error('❌ Error reading profile from smart contract:', error);
    }

    // Fallback to localStorage
    return profileStorage.getProfile(address);
  }
}

const blockchainFollowService = new BlockchainFollowService();

const SETTINGS_KEY = 'hibeats_notification_settings';
const NOTIFICATION_CHECK_INTERVAL = 30000; // 30 seconds

interface UserNotificationData {
  userAddress: string;
  notifications: NotificationData[];
  lastChecked: number;
  version: number;
}

interface NotificationCache {
  data: NotificationData[];
  lastSync: number;
  lastProcessedInteractions: Map<string, number>; // songId -> lastTimestamp
}

class IPFSNotificationService {
  private listeners: Set<(notifications: NotificationData[]) => void> = new Set();
  private cache: Map<string, NotificationCache> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;
  private currentUserAddress: string | null = null;

  /**
   * Initialize IPFS notification service for a user
   */
  async initialize(userAddress: string): Promise<void> {
    if (this.isInitialized && this.currentUserAddress === userAddress) return;

    this.cleanup();
    this.currentUserAddress = userAddress;

    // Load existing notifications and start monitoring
    await this.loadNotificationsFromIPFS(userAddress);
    this.startIPFSMonitoring(userAddress);
    this.isInitialized = true;

  }

  /**
   * Cleanup when user disconnects
   */
  cleanup(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.listeners.clear();
    this.isInitialized = false;
    this.currentUserAddress = null;
  }

  /**
   * Subscribe to notification updates
   */
  subscribe(callback: (notifications: NotificationData[]) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Get notifications for current user
   */
  async getNotifications(userAddress: string): Promise<NotificationData[]> {
    console.log('🔥 === ipfsNotificationService.getNotifications START ===');
    console.log('👤 User address:', userAddress);

    const cacheKey = userAddress.toLowerCase();
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.lastSync < 60000) { // 1 minute cache
      console.log('💾 Using cached notifications:', cached.data.length);
      return cached.data;
    }

    console.log('⏳ Cache miss, loading from IPFS...');
    const result = await this.loadNotificationsFromIPFS(userAddress);
    console.log('🔥 === ipfsNotificationService.getNotifications END ===');
    return result;
  }

  /**
   * Load notifications by scanning IPFS social interactions AND blockchain follow events
   */
  private async loadNotificationsFromIPFS(userAddress: string): Promise<NotificationData[]> {
    try {
      const cacheKey = userAddress.toLowerCase();
      const notifications: NotificationData[] = [];
      const lastProcessedInteractions = new Map<string, number>();

      console.log('📊 Loading all notifications for user:', userAddress);

      // FIRST: Load follow notifications from blockchain
      try {
        const followNotifications = await this.loadFollowNotificationsFromBlockchain(userAddress);
        notifications.push(...followNotifications);
        console.log('👥 Loaded follow notifications from blockchain:', followNotifications.length);
      } catch (error) {
        console.error('❌ Error loading follow notifications from blockchain:', error);
      }

      // SECOND: Get all songs that user owns to check for interactions
      const userSongs = await this.getUserOwnedSongs(userAddress);

      for (const song of userSongs) {
        try {
          // Load interactions for each song
          const interactions = await socialIPFSService.loadSongInteractions(song.id);
          const lastProcessed = this.cache.get(cacheKey)?.lastProcessedInteractions.get(song.id) || 0;

          // Process new likes
          const newLikes = interactions.likes.filter(like =>
            like.timestamp > lastProcessed &&
            like.userAddress !== userAddress
          );

          for (const like of newLikes) {
            notifications.push(this.createLikeNotification(like, song));
          }

          // Process new comments
          const newComments = interactions.comments.filter(comment =>
            comment.timestamp > lastProcessed &&
            comment.userAddress !== userAddress &&
            !comment.parentId // Only direct comments, not replies
          );

          for (const comment of newComments) {
            notifications.push(this.createCommentNotification(comment, song));
          }

          // Update last processed timestamp
          const latestTimestamp = Math.max(
            ...interactions.likes.map(l => l.timestamp),
            ...interactions.comments.map(c => c.timestamp),
            lastProcessed
          );
          lastProcessedInteractions.set(song.id, latestTimestamp);

        } catch (error) {
          // console.warn(`Failed to load interactions for song ${song.id}:`, error);
        }
      }

      // Load follow notifications from blockchain/storage
      try {
        const followNotifications = await this.getFollowNotificationsFromStorage(userAddress);
        notifications.push(...followNotifications);
      } catch (error) {
        console.warn('Error loading follow notifications:', error);
      }

      // Apply read status to all notifications
      const readKey = `hibeats_read_notifications_${userAddress.toLowerCase()}`;
      let readNotifications: Set<string> = new Set();
      try {
        const existing = localStorage.getItem(readKey);
        if (existing) {
          readNotifications = new Set(JSON.parse(existing));
        }
      } catch (error) {
        // Ignore read status errors
      }

      // Update read status for all notifications
      notifications.forEach(notification => {
        if (readNotifications.has(notification.id)) {
          notification.isRead = true;
        }
      });

      // Sort notifications by timestamp (newest first)
      notifications.sort((a, b) => b.timestamp - a.timestamp);

      // Update cache
      this.cache.set(cacheKey, {
        data: notifications,
        lastSync: Date.now(),
        lastProcessedInteractions
      });

      return notifications;

    } catch (error) {
      console.error('Error loading notifications from IPFS:', error);
      return [];
    }
  }

  /**
   * Get user's owned songs (stub - implement based on your NFT/song ownership logic)
   */
  private async getUserOwnedSongs(userAddress: string): Promise<Array<{id: string, title: string}>> {
    // TODO: Implement this based on your NFT contract or song ownership system
    // For now, we'll check a registry in localStorage as a fallback
    try {
      const registry = localStorage.getItem('hibeats_user_songs_registry');
      if (registry) {
        const parsed = JSON.parse(registry);
        return parsed[userAddress.toLowerCase()] || [];
      }
    } catch (error) {
      // console.warn('Error loading user songs registry:', error);
    }

    return [];
  }

  /**
   * Register a song as owned by user (call this when minting/creating songs)
   */
  registerUserSong(userAddress: string, songId: string, songTitle: string): void {
    try {
      let registry: Record<string, Array<{id: string, title: string}>> = {};

      const existing = localStorage.getItem('hibeats_user_songs_registry');
      if (existing) {
        registry = JSON.parse(existing);
      }

      const userKey = userAddress.toLowerCase();
      if (!registry[userKey]) {
        registry[userKey] = [];
      }

      // Add song if not already exists
      if (!registry[userKey].find(song => song.id === songId)) {
        registry[userKey].push({ id: songId, title: songTitle });
        localStorage.setItem('hibeats_user_songs_registry', JSON.stringify(registry));
      }
    } catch (error) {
      console.error('Error registering user song:', error);
    }
  }

  /**
   * Start monitoring IPFS for new interactions
   */
  private startIPFSMonitoring(userAddress: string): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(async () => {
      try {
        const notifications = await this.loadNotificationsFromIPFS(userAddress);
        this.notifyListeners(notifications);
      } catch (error) {
        console.error('Error in IPFS notification monitoring:', error);
      }
    }, NOTIFICATION_CHECK_INTERVAL);

  }

  /**
   * Create notification from like interaction
   */
  private createLikeNotification(like: any, song: {id: string, title: string}): NotificationData {
    // Get user profile from profile storage for better display info
    const userProfile = profileStorage.getProfile(like.userAddress);
    const displayName = userProfile?.displayName || userProfile?.username || this.formatUsername(like.userAddress);
    const avatar = userProfile?.avatar;

    return {
      id: `like_${like.id}`,
      type: 'like',
      title: 'New Like',
      message: `${displayName} liked your song "${song.title}"`,
      timestamp: like.timestamp,
      isRead: false,
      fromUser: {
        address: like.userAddress,
        username: displayName,
        avatar: avatar,
      },
      toUser: this.currentUserAddress!,
      metadata: {
        songId: song.id,
        songTitle: song.title,
      },
      actionUrl: `/song/${song.id}`
    };
  }

  /**
   * Create notification from comment interaction
   */
  private createCommentNotification(comment: any, song: {id: string, title: string}): NotificationData {
    // Get user profile from profile storage for better display info
    const userProfile = profileStorage.getProfile(comment.userAddress);
    const displayName = userProfile?.displayName || userProfile?.username || comment.username || this.formatUsername(comment.userAddress);
    const avatar = userProfile?.avatar;

    return {
      id: `comment_${comment.id}`,
      type: 'comment',
      title: 'New Comment',
      message: `${displayName} commented on your song "${song.title}"`,
      timestamp: comment.timestamp,
      isRead: false,
      fromUser: {
        address: comment.userAddress,
        username: displayName,
        avatar: avatar,
      },
      toUser: this.currentUserAddress!,
      metadata: {
        songId: song.id,
        songTitle: song.title,
        commentId: comment.id,
        commentText: comment.comment?.slice(0, 100),
      },
      actionUrl: `/song/${song.id}`
    };
  }

  /**
   * Get follow notifications from blockchain/storage data
   */
  private async getFollowNotificationsFromStorage(userAddress: string): Promise<NotificationData[]> {
    const followNotifications: NotificationData[] = [];

    try {
      // Get followers for this user from blockchain/storage
      const followers = await blockchainFollowService.getFollowers(userAddress);

      // Create notifications for recent follows (last 30 days)
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

      for (const followerAddress of followers) {
        // Get follow relationships to find timestamp
        const followRelationships = await blockchainFollowService.getFollowRelationships();
        const relationship = followRelationships.find(rel =>
          rel.follower === followerAddress && rel.following === userAddress
        );

        if (relationship) {
          const followTimestamp = new Date(relationship.timestamp).getTime();

          // Only include recent follows
          if (followTimestamp > thirtyDaysAgo) {
            // Get follower profile for better notification data
            const followerProfile = await blockchainFollowService.getProfile(followerAddress);
            // Also try local profile storage as fallback
            const localProfile = profileStorage.getProfile(followerAddress);

            const displayName = followerProfile?.username || followerProfile?.displayName ||
                               localProfile?.displayName || localProfile?.username ||
                               this.formatUsername(followerAddress);
            const avatar = followerProfile?.avatar || localProfile?.avatar;

            const notification: NotificationData = {
              id: `follow_${followerAddress}_${userAddress}_${followTimestamp}`,
              type: 'follow',
              title: 'New Follower',
              message: `${displayName} started following you`,
              timestamp: followTimestamp,
              isRead: false,
              fromUser: {
                address: followerAddress,
                username: displayName,
                avatar: avatar
              },
              toUser: userAddress,
              actionUrl: `/profile/${followerAddress}`
            };

            followNotifications.push(notification);
          }
        }
      }

      // Sort by timestamp (newest first)
      followNotifications.sort((a, b) => b.timestamp - a.timestamp);

    } catch (error) {
      console.error('Error generating follow notifications from storage:', error);
    }

    return followNotifications;
  }

  /**
   * Format username for display
   */
  private formatUsername(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Mark notifications as read (store in localStorage for now)
   */
  async markAsRead(userAddress: string, notificationIds: string[]): Promise<boolean> {
    try {
      const readKey = `hibeats_read_notifications_${userAddress.toLowerCase()}`;
      let readNotifications: Set<string> = new Set();

      try {
        const existing = localStorage.getItem(readKey);
        if (existing) {
          readNotifications = new Set(JSON.parse(existing));
        }
      } catch (error) {
        // console.warn('Error loading read notifications:', error);
      }

      // Add new read notifications
      notificationIds.forEach(id => readNotifications.add(id));

      // Save back to localStorage
      localStorage.setItem(readKey, JSON.stringify([...readNotifications]));

      // Follow notifications read status is handled by the main read notifications system
      // No need for separate storage since follow notifications are generated from profileStorage

      // Update cache
      const cacheKey = userAddress.toLowerCase();
      const cached = this.cache.get(cacheKey);
      if (cached) {
        cached.data = cached.data.map(notification => ({
          ...notification,
          isRead: readNotifications.has(notification.id) || notification.isRead
        }));
        this.notifyListeners(cached.data);
      }

      return true;
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userAddress: string): Promise<boolean> {
    const notifications = await this.getNotifications(userAddress);
    const allIds = notifications.map(n => n.id);
    return this.markAsRead(userAddress, allIds);
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userAddress: string): Promise<number> {
    try {
      const readKey = `hibeats_read_notifications_${userAddress.toLowerCase()}`;
      const readNotifications = new Set<string>();

      try {
        const existing = localStorage.getItem(readKey);
        if (existing) {
          JSON.parse(existing).forEach((id: string) => readNotifications.add(id));
        }
      } catch (error) {
        // console.warn('Error loading read notifications:', error);
      }

      const notifications = await this.getNotifications(userAddress);
      return notifications.filter(n => !readNotifications.has(n.id)).length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Get notification settings
   */
  getSettings(): NotificationSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }

    return {
      likes: true,
      comments: true,
      follows: true,
      songMentions: true,
      playlistAdds: true,
      emailNotifications: false,
      pushNotifications: true
    };
  }

  /**
   * Update notification settings
   */
  updateSettings(settings: NotificationSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  /**
   * Create a follow notification by triggering cache refresh
   * Follow notifications are automatically generated from smart contract data
   */
  async createFollowNotification(params: CreateNotificationParams): Promise<boolean> {
    try {
      console.log('🔔 createFollowNotification called');
      console.log('   Type:', params.type);
      console.log('   To User:', params.toUser);
      console.log('   From User:', params.fromUser.address);

      if (params.type !== 'follow' || !params.toUser) {
        console.log('❌ Invalid notification params');
        return false;
      }

      console.log('🗑️ Clearing cache for user:', params.toUser);
      // Clear cache to force reload of follow notifications from smart contract
      const cacheKey = params.toUser.toLowerCase();
      this.cache.delete(cacheKey);

      console.log('📖 Reloading notifications for user:', params.toUser);
      // Reload notifications which will now include the new follow
      const allNotifications = await this.getNotifications(params.toUser);
      console.log('📊 Total notifications after reload:', allNotifications.length);

      // Check if there are any follow notifications
      const followNotifications = allNotifications.filter(n => n.type === 'follow');
      console.log('👥 Follow notifications found:', followNotifications.length);

      // Notify listeners of the updated notifications
      console.log('🔔 Notifying listeners...');
      this.notifyListeners(allNotifications);

      return true;
    } catch (error) {
      console.error('❌ Error refreshing follow notifications:', error);
      return false;
    }
  }

  /**
   * Force refresh notifications from IPFS
   */
  async refreshNotifications(userAddress: string): Promise<void> {
    // Clear cache to force reload
    this.cache.delete(userAddress.toLowerCase());
    const notifications = await this.loadNotificationsFromIPFS(userAddress);
    this.notifyListeners(notifications);
  }

  /**
   * Load follow notifications from blockchain events
   */
  private async loadFollowNotificationsFromBlockchain(userAddress: string): Promise<NotificationData[]> {
    try {
      console.log('🔥 === START loadFollowNotificationsFromBlockchain ===');
      console.log('👥 Loading follow notifications from blockchain for:', userAddress);
      console.log('🔗 Contract address:', CONTRACT_ADDRESSES.HIBEATS_PROFILE);
      console.log('🌐 RPC URL check:', publicClient.transport);

      // Get current block number
      console.log('⏳ Getting current block number...');
      const currentBlock = await publicClient.getBlockNumber();
      console.log('✅ Current block number:', currentBlock);
      const BLOCK_RANGE_LIMIT = 500n;
      const fromBlock = currentBlock > BLOCK_RANGE_LIMIT ? currentBlock - BLOCK_RANGE_LIMIT : 0n;

      console.log('📊 Querying follow events from block:', fromBlock, 'to:', currentBlock);

      // Get UserFollowed events where this user was followed
      const followedEvents = await publicClient.getLogs({
        address: CONTRACT_ADDRESSES.HIBEATS_PROFILE,
        event: {
          type: 'event',
          name: 'UserFollowed',
          inputs: [
            { name: 'follower', type: 'address', indexed: true },
            { name: 'following', type: 'address', indexed: true }
          ]
        },
        args: {
          following: userAddress as `0x${string}`
        },
        fromBlock,
        toBlock: currentBlock
      });

      console.log('📊 Found follow events:', followedEvents.length);

      const notifications: NotificationData[] = [];

      // Convert follow events to notifications
      for (const event of followedEvents) {
        try {
          const followerAddress = event.args?.follower;
          if (!followerAddress) continue;

          // Get block details for timestamp
          const block = await publicClient.getBlock({ blockNumber: event.blockNumber });
          const timestamp = Number(block.timestamp) * 1000;

          // Get follower profile from smart contract
          let followerProfile = null;
          let displayName = `${followerAddress.slice(0, 6)}...${followerAddress.slice(-4)}`;
          let avatarUrl = undefined;

          console.log('📧 Processing follower address:', followerAddress);

          try {
            // Try to get profile from smart contract
            const contractProfile = await publicClient.readContract({
              address: CONTRACT_ADDRESSES.HIBEATS_PROFILE,
              abi: HIBEATS_PROFILE_ABI,
              functionName: 'getProfile',
              args: [followerAddress as `0x${string}`]
            }) as any;

            console.log('📋 Smart contract profile result:', contractProfile);
            console.log('📋 Profile result type:', typeof contractProfile);
            console.log('📋 Profile result keys:', Object.keys(contractProfile || {}));

            // Check if result is an array (tuple) from contract
            if (Array.isArray(contractProfile) && contractProfile.length > 0) {
              console.log('📋 Contract returned array/tuple:', contractProfile);
              // Assuming the order: [username, displayName, bio, avatar, ...]
              const [username, displayNameFromContract, bio, avatar] = contractProfile;
              console.log('📋 Parsed from tuple:', { username, displayNameFromContract, bio, avatar });

              if (username || displayNameFromContract) {
                displayName = username || displayNameFromContract || displayName;
                avatarUrl = avatar;
                console.log('✅ Using smart contract tuple data');
              } else {
                console.log('ℹ️ Tuple exists but no username/displayName');
              }
            } else if (contractProfile && (contractProfile.username || contractProfile.displayName)) {
              displayName = contractProfile.username || contractProfile.displayName || displayName;
              avatarUrl = contractProfile.avatar;
              console.log('✅ Using smart contract object data');
            } else {
              console.log('ℹ️ No profile data in smart contract, using address fallback');
            }
          } catch (contractError) {
            console.log('❌ Smart contract profile read failed:', contractError);
            console.log('ℹ️ Using address fallback');
          }

          // Also try to get profile from local profile storage as fallback
          if (!avatarUrl || displayName.includes('...')) {
            const localProfile = profileStorage.getProfile(followerAddress);
            if (localProfile) {
              displayName = localProfile.displayName || localProfile.username || displayName;
              avatarUrl = localProfile.avatar || avatarUrl;
              console.log('✅ Using local profile storage data');
            }
          }

          console.log('🏷️ Final display name:', displayName);
          console.log('🖼️ Final avatar URL:', avatarUrl);

          const notification: NotificationData = {
            id: `follow_${event.transactionHash}_${event.logIndex}`,
            type: 'follow',
            title: 'New Follower',
            message: `${displayName} started following you`,
            timestamp,
            isRead: false,
            fromUser: {
              address: followerAddress,
              username: displayName,
              avatar: avatarUrl
            },
            actionUrl: `/creator/${followerAddress}`,
            metadata: {
              followerAddress,
              blockNumber: event.blockNumber.toString(),
              transactionHash: event.transactionHash
            }
          };

          notifications.push(notification);
          console.log('✅ Created follow notification:', notification.title);
        } catch (error) {
          console.error('❌ Error processing follow event:', error);
        }
      }

      console.log('👥 Total follow notifications created:', notifications.length);
      console.log('🔥 === END loadFollowNotificationsFromBlockchain ===');
      return notifications;
    } catch (error) {
      console.error('❌ Error loading follow notifications from blockchain:', error);
      console.error('❌ Full error details:', error);
      console.log('🔥 === END loadFollowNotificationsFromBlockchain (ERROR) ===');
      return [];
    }
  }

  /**
   * Notify all listeners of notification updates
   */
  private notifyListeners(notifications: NotificationData[]): void {
    this.listeners.forEach(callback => {
      try {
        callback(notifications);
      } catch (error) {
        console.error('Error notifying listener:', error);
      }
    });
  }
}

export const ipfsNotificationService = new IPFSNotificationService();