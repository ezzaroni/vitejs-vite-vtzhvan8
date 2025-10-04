import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES, HIBEATS_PROFILE_ABI } from '../contracts';

export function useCreatorProfile(address?: string) {
  const { data: creatorData, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.HIBEATS_PROFILE,
    abi: HIBEATS_PROFILE_ABI,
    functionName: 'getCreatorProfile',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const creatorProfile = creatorData?.[0];
  const profileExists = creatorProfile && creatorProfile.isActive;

  const creator = profileExists ? {
    username: creatorProfile.username || '',
    displayName: creatorProfile.displayName || '',
    bio: creatorProfile.bio || '',
    avatar: creatorProfile.profileImageUrl || '',
    coverImage: creatorProfile.bannerImageUrl || '',
    website: creatorProfile.website || '',
    twitter: creatorProfile.twitter || '',
    instagram: creatorProfile.instagram || '',
    spotify: creatorProfile.spotify || '',
    isVerified: creatorProfile.isVerified || false,
    isActive: creatorProfile.isActive || false,
    followerCount: Number(creatorProfile.followerCount || 0),
  } : null;

  return {
    creator,
    profileExists,
    isLoading,
    error,
    refetch,
  };
}