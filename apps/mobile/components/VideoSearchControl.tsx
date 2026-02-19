import { MonsterButton } from '@/components/MonsterButton';
import { MonsterCard } from '@/components/MonsterCard';
import { MonsterColors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { searchExerciseVideo } from '@/lib/ai';
import { supabase } from '@/lib/supabase';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import YoutubePlayer from "react-native-youtube-iframe";

interface VideoData {
  title: string;
  url: string;
  thumbnail: string;
}

interface VideoSearchControlProps {
  exerciseName: string;
}

export function VideoSearchControl({ exerciseName }: VideoSearchControlProps) {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [savedVideo, setSavedVideo] = useState<VideoData | null>(null);
  const [searchResults, setSearchResults] = useState<VideoData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    fetchSavedVideo();
  }, [exerciseName]);

  const fetchSavedVideo = async () => {
    if (!session?.user) return;

    const { data } = await supabase
      .from('user_exercise_videos')
      .select('video_url, video_title, thumbnail_url')
      .eq('user_id', session.user.id)
      .eq('exercise_name', exerciseName)
      .maybeSingle();

    if (data) {
      setSavedVideo({
        title: data.video_title || 'Vídeo Salvo',
        url: data.video_url,
        thumbnail: data.thumbnail_url || 'https://img.youtube.com/vi/default/hqdefault.jpg', // Fallback
      });
    } else {
        setSavedVideo(null);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setSearchResults([]);
    setCurrentIndex(0);
    setPlaying(false);
    try {
      const results = await searchExerciseVideo(exerciseName);
      if (results && results.length > 0) {
        setSearchResults(results);
      } else {
        Alert.alert('Monstro', 'Não encontrei vídeos para esse exercício. Tente novamente.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha na busca.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextOption = () => {
    setPlaying(false);
    if (currentIndex < searchResults.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
        Alert.alert('Fim', 'Essas foram as opções que encontrei. Buscando novamente...');
        handleSearch();
        setCurrentIndex(0);
    }
  };

  const handleSave = async () => {
    if (!session?.user) return;
    const video = searchResults[currentIndex];

    // Optimistic update
    setSavedVideo(video);
    setSearchResults([]);

    const { error } = await supabase
      .from('user_exercise_videos')
      .upsert({
        user_id: session.user.id,
        exercise_name: exerciseName,
        video_url: video.url,
        video_title: video.title,
        thumbnail_url: video.thumbnail,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id, exercise_name' });

    if (error) {
        console.error(error);
        Alert.alert('Erro', 'Falha ao salvar vídeo.');
        fetchSavedVideo(); // Revert
    }
  };

  const handleRemove = async () => {
     if (!session?.user) return;
     setSavedVideo(null); // Optimistic

     const { error } = await supabase
        .from('user_exercise_videos')
        .delete()
        .eq('user_id', session.user.id)
        .eq('exercise_name', exerciseName);

     if (error) {
         Alert.alert('Erro', 'Falha ao remover.');
         fetchSavedVideo();
     }
  };

  const getYoutubeId = (url: string) => {
      const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = url.match(regex);
      return match ? match[1] : null;
  };

  const onStateChange = useCallback((state: string) => {
    if (state === "ended") {
      setPlaying(false);
    }
  }, []);

  const renderVideoPlayer = (video: VideoData) => {
      const videoId = getYoutubeId(video.url);

      if (!videoId) {
          return (
              <View style={styles.videoError}>
                  <Text style={{color: '#fff'}}>Erro ao carregar vídeo</Text>
              </View>
          );
      }

      console.log(`Rendering player for video: ${video.title} (${videoId})`);

      return (
          <View style={styles.playerContainer}>
             <YoutubePlayer
                key={videoId} // Force re-mount when video changes to ensure player updates
                height={200}
                play={playing}
                videoId={videoId}
                onChangeState={onStateChange}
                // webviewProps={{ allowsInlineMediaPlayback: true }} // Important for iOS
             />
          </View>
      );
  };

  if (loading) {
      return (
          <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={MonsterColors.primary} />
              <Text style={styles.loadingText}>Monstro buscando...</Text>
          </View>
      );
  }

  // 1. Saved Video State
  if (savedVideo) {
      return (
          <MonsterCard title="Como Fazer (Salvo)">
               {renderVideoPlayer(savedVideo)}

               <Text style={styles.videoTitle}>{savedVideo.title}</Text>

              <View style={styles.savedActions}>
                   {/* Remove Play button, player is embedded */}
                   <MonsterButton
                      title="Trocar Vídeo"
                      icon="refresh"
                      variant="outline"
                      onPress={handleSearch}
                      style={{ flex: 1 }}
                   />
              </View>
          </MonsterCard>
      );
  }

  // 2. Search Results State
  if (searchResults.length > 0) {
      const currentVideo = searchResults[currentIndex];
      return (
          <MonsterCard title="Resultado da Busca">
               {renderVideoPlayer(currentVideo)}

               <Text style={styles.videoTitle}>{currentVideo.title}</Text>

              <View style={styles.actionRow}>
                  <MonsterButton
                      title="Salvar Este"
                      icon="save"
                      onPress={handleSave}
                      style={{ flex: 1 }}
                      variant="secondary"
                  />
              </View>
               <MonsterButton
                    title="Não gostei, próximo"
                    icon="arrow-right"
                    onPress={handleNextOption}
                    variant="outline"
                />
          </MonsterCard>
      );
  }

  // 3. Initial Empty State
  return (
      <MonsterCard title="Aprender o Movimento">
          <View style={styles.emptyContainer}>
              <FontAwesome name="youtube-play" size={40} color={MonsterColors.textSecondary} style={{ marginBottom: 10 }} />
              <Text style={styles.emptyText}>
                  Busque um vídeo tutorial no YouTube para aprender a execução correta deste exercício.
              </Text>
              <MonsterButton
                  title="Buscar Vídeo"
                  icon="search"
                  onPress={handleSearch}
                  style={{ marginTop: 20, width: '100%' }}
              />
          </View>
      </MonsterCard>
  );
}

const styles = StyleSheet.create({
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: MonsterColors.textSecondary,
        marginTop: 10,
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 10,
    },
    emptyText: {
        color: MonsterColors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    playerContainer: {
        width: '100%',
        height: 200,
        backgroundColor: '#000',
        marginBottom: 10,
        overflow: 'hidden',
        borderRadius: 8,
    },
    videoError: {
        width: '100%',
        height: 200,
        backgroundColor: '#333',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        marginBottom: 10,
    },
    videoTitle: {
        color: MonsterColors.text,
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 10,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },
    savedActions: {
        flexDirection: 'row',
        marginTop: 10,
    }
});
