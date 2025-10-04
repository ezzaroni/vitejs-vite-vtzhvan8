import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { NotificationData, NotificationSettings, CreateNotificationParams } from '@/types/notifications';
import { ipfsNotificationService } from '@/services/ipfsNotificationService';

export const useNotifications = () => {
  const { address } = useAccount();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState<NotificationSettings>(ipfsNotificationService.getSettings());
  const [isLoading, setIsLoading] = useState(false);

  // Load notifications when user connects
  useEffect(() => {
    if (!address) {
      setNotifications([]);
      setUnreadCount(0);
      ipfsNotificationService.cleanup();
      return;
    }

    const loadNotifications = async () => {
      console.log('🔥 === useNotifications: loadNotifications START ===');
      console.log('👤 Address:', address);
      setIsLoading(true);
      try {
        await ipfsNotificationService.initialize(address);
        console.log('⏳ Calling ipfsNotificationService.getNotifications...');
        const userNotifications = await ipfsNotificationService.getNotifications(address);
        console.log('📊 Received notifications count:', userNotifications.length);
        console.log('📋 Notifications data:', userNotifications);

        const unread = await ipfsNotificationService.getUnreadCount(address);
        console.log('📬 Unread count:', unread);

        setNotifications(userNotifications);
        setUnreadCount(unread);
        console.log('✅ State updated with notifications');
      } catch (error) {
        console.error('❌ Error loading notifications:', error);
        console.error('❌ Full error details:', error);
      } finally {
        setIsLoading(false);
        console.log('🔥 === useNotifications: loadNotifications END ===');
      }
    };

    loadNotifications();

    // Subscribe to real-time updates
    const unsubscribe = ipfsNotificationService.subscribe(async (updatedNotifications) => {
      setNotifications(updatedNotifications);
      const unread = await ipfsNotificationService.getUnreadCount(address);
      setUnreadCount(unread);
    });

    // Set up periodic refresh for blockchain notifications
    const refreshInterval = setInterval(async () => {
      try {
        const freshNotifications = await ipfsNotificationService.getNotifications(address);
        const unread = await ipfsNotificationService.getUnreadCount(address);

        // Only update if there are changes
        if (freshNotifications.length !== notifications.length || unread !== unreadCount) {
          setNotifications(freshNotifications);
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error('Error in periodic notification refresh:', error);
      }
    }, 30000); // Check every 30 seconds

    return () => {
      unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [address, notifications.length, unreadCount]);

  // Create notification (including follow notifications)
  const createNotification = useCallback(async (params: CreateNotificationParams): Promise<boolean> => {
    // Check if notification type is disabled
    if (!settings[params.type]) {
      console.log('❌ Notification type disabled:', params.type);
      return false;
    }

    // Prevent self-notifications (when someone tries to follow themselves)
    if (params.fromUser.address === params.toUser) {
      console.log('❌ Self-notification prevented');
      return false;
    }

    console.log('✅ Creating notification:', params.type, 'from:', params.fromUser.address, 'to:', params.toUser);

    // Handle follow notifications specially
    if (params.type === 'follow') {
      return await ipfsNotificationService.createFollowNotification(params);
    }

    // For other IPFS-based notifications, they are automatically detected from IPFS social interactions
    return true;
  }, [settings]);

  // Mark notifications as read
  const markAsRead = useCallback(async (notificationIds: string[]): Promise<boolean> => {
    if (!address) return false;

    const success = await ipfsNotificationService.markAsRead(address, notificationIds);
    if (success) {
      const updatedNotifications = await ipfsNotificationService.getNotifications(address);
      const unread = await ipfsNotificationService.getUnreadCount(address);
      setNotifications(updatedNotifications);
      setUnreadCount(unread);
    }
    return success;
  }, [address]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    if (!address) return false;

    const success = await ipfsNotificationService.markAllAsRead(address);
    if (success) {
      const updatedNotifications = await ipfsNotificationService.getNotifications(address);
      setNotifications(updatedNotifications);
      setUnreadCount(0);
    }
    return success;
  }, [address]);

  // Delete notification (for IPFS, we just mark as read since data is immutable)
  const deleteNotification = useCallback(async (notificationId: string): Promise<boolean> => {
    if (!address) return false;

    // Since IPFS data is immutable, we simulate deletion by marking as read
    const success = await ipfsNotificationService.markAsRead(address, [notificationId]);
    if (success) {
      // Filter out the "deleted" notification from local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      const unread = await ipfsNotificationService.getUnreadCount(address);
      setUnreadCount(unread);
    }
    return success;
  }, [address]);

  // Update settings
  const updateSettings = useCallback((newSettings: NotificationSettings) => {
    ipfsNotificationService.updateSettings(newSettings);
    setSettings(newSettings);
  }, []);

  // Register user song (call this when user creates/mints a song)
  const registerUserSong = useCallback((songId: string, songTitle: string) => {
    if (address) {
      ipfsNotificationService.registerUserSong(address, songId, songTitle);
    }
  }, [address]);

  // Force refresh notifications from IPFS
  const refreshNotifications = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      await ipfsNotificationService.refreshNotifications(address);
      const updatedNotifications = await ipfsNotificationService.getNotifications(address);
      const unread = await ipfsNotificationService.getUnreadCount(address);
      setNotifications(updatedNotifications);
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  // Helper functions for creating specific notification types
  const notifyLike = useCallback(async (params: {
    toUser: string;
    songId: string;
    songTitle: string;
    fromUser: { address: string; username?: string; avatar?: string };
  }) => {
    return createNotification({
      type: 'like',
      fromUser: params.fromUser,
      toUser: params.toUser,
      metadata: {
        songId: params.songId,
        songTitle: params.songTitle
      }
    });
  }, [createNotification]);

  const notifyComment = useCallback(async (params: {
    toUser: string;
    songId: string;
    songTitle: string;
    commentId: string;
    commentText: string;
    fromUser: { address: string; username?: string; avatar?: string };
  }) => {
    return createNotification({
      type: 'comment',
      fromUser: params.fromUser,
      toUser: params.toUser,
      metadata: {
        songId: params.songId,
        songTitle: params.songTitle,
        commentId: params.commentId,
        commentText: params.commentText
      }
    });
  }, [createNotification]);

  const notifyFollow = useCallback(async (params: {
    toUser: string;
    fromUser: { address: string; username?: string; avatar?: string };
  }) => {
    return createNotification({
      type: 'follow',
      fromUser: params.fromUser,
      toUser: params.toUser
    });
  }, [createNotification]);

  const notifyPlaylistAdd = useCallback(async (params: {
    toUser: string;
    songId: string;
    songTitle: string;
    playlistId: string;
    playlistName: string;
    fromUser: { address: string; username?: string; avatar?: string };
  }) => {
    return createNotification({
      type: 'playlist_add',
      fromUser: params.fromUser,
      toUser: params.toUser,
      metadata: {
        songId: params.songId,
        songTitle: params.songTitle,
        playlistId: params.playlistId,
        playlistName: params.playlistName
      }
    });
  }, [createNotification]);

  // Get recent notifications (last 7 days)
  const recentNotifications = notifications.filter(
    n => Date.now() - n.timestamp < 7 * 24 * 60 * 60 * 1000
  );

  return {
    // State
    notifications,
    recentNotifications,
    unreadCount,
    settings,
    isLoading,

    // Actions
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updateSettings,
    refreshNotifications,

    // IPFS specific
    registerUserSong,

    // Notification creators (legacy - now handled automatically by IPFS monitoring)
    notifyLike,
    notifyComment,
    notifyFollow,
    notifyPlaylistAdd,
    createNotification,
  };
};