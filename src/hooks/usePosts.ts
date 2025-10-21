import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, Post, CreatePostData } from '../lib/api';

// 문서 목록 조회
export const usePosts = () => {
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      console.log('📡 문서 목록 API 호출 시작...');
      const response = await api.getDocs();
      console.log('✅ 문서 목록 API 응답:', response.data);
      return response.data as Post[];
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });
};

// 특정 문서 조회
export const usePost = (id: string) => {
  return useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      const response = await api.getDoc(id);
      return response.data as Post;
    },
    enabled: !!id,
  });
};

// 문서 생성
export const useCreatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreatePostData) => api.createDoc(data),
    onSuccess: () => {
      // 문서 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

// 문서 수정
export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePostData> }) => 
      api.updateDoc(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', id] });
    },
  });
};

// 문서 삭제
export const useDeletePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.deleteDoc(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};
