'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Play, CheckCircle, Lock, ArrowLeft, ArrowRight, Award } from 'lucide-react';
import { formatDuration } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface LearnContentProps {
  course: any;
  currentChapter: any;
  prevChapter: any;
  nextChapter: any;
  progress: any[];
  progressPercentage: number;
  enrollment: any;
}

export function LearnContent({
  course,
  currentChapter,
  prevChapter,
  nextChapter,
  progress,
  progressPercentage,
  enrollment,
}: LearnContentProps) {
  const router = useRouter();

  const handleMarkComplete = async () => {
    // TODO: Implement mark as complete
    alert('Fitur mark as complete akan segera hadir!');
  };

  return (
    <div className="container py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/course/${course.slug}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Detail Kursus
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content - Video Player */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <div className="bg-black rounded-xl overflow-hidden aspect-video">
            {currentChapter.videoUrl ? (
              <div className="w-full h-full flex items-center justify-center bg-navy">
                <div className="text-center text-white p-8">
                  <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-bold mb-2">{currentChapter.title}</h3>
                  <p className="text-gray-400">Video Player Placeholder</p>
                  <p className="text-sm text-gray-500 mt-2">
                    (Integrate with YouTube/Vimeo/Wistia here)
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-navy">
                <div className="text-center text-white p-8">
                  <Lock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-bold mb-2">Chapter Not Available</h3>
                  <p className="text-gray-400">Video content is not available yet</p>
                </div>
              </div>
            )}
          </div>

          {/* Chapter Info */}
          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="font-heading text-2xl font-bold mb-2">
                  {currentChapter.title}
                </h1>
                <p className="text-muted-foreground">
                  {currentChapter.description || 'No description available'}
                </p>
              </div>
              <Badge variant={currentChapter.isFree ? 'free' : 'pro'}>
                {currentChapter.isFree ? 'Preview Gratis' : 'Premium'}
              </Badge>
            </div>

            {/* Chapter Actions */}
            <div className="flex items-center gap-4">
              <Button
                variant={progress.find(p => p.chapterId === currentChapter.id)?.isCompleted ? 'default' : 'outline'}
                onClick={handleMarkComplete}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {progress.find(p => p.chapterId === currentChapter.id)?.isCompleted 
                  ? 'Selesai' 
                  : 'Tandai Selesai'}
              </Button>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Play className="w-4 h-4" />
                <span>{formatDuration(currentChapter.duration)}</span>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              {prevChapter ? (
                <Button variant="outline" onClick={() => router.push(`/learn/${course.slug}/${prevChapter.id}`)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Chapter Sebelumnya
                </Button>
              ) : (
                <div />
              )}
              
              {nextChapter ? (
                <Button variant="amber" onClick={() => router.push(`/learn/${course.slug}/${nextChapter.id}`)}>
                  Chapter Selanjutnya
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button variant="amber" onClick={() => router.push(`/course/${course.slug}`)}>
                  <Award className="w-4 h-4 mr-2" />
                  Lihat Sertifikat
                </Button>
              )}
            </div>
          </div>

          {/* Instructor Info */}
          <div className="bg-card rounded-xl border p-6">
            <h2 className="font-heading text-xl font-bold mb-4">Instruktur</h2>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber to-orange-400 flex items-center justify-center text-white text-xl font-bold">
                {course.instructor.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{course.instructor.name}</h3>
                <p className="text-sm text-muted-foreground">Professional Instructor</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Course Curriculum */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl border p-6 sticky top-24">
            <h2 className="font-heading text-xl font-bold mb-4">
              Daftar Chapter
            </h2>
            
            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="text-sm font-medium">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Chapter List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {course.chapters.map((chapter: any, index: number) => {
                const isCompleted = progress.find(p => p.chapterId === chapter.id)?.isCompleted;
                const isCurrent = chapter.id === currentChapter.id;
                const isLocked = !chapter.isFree && !enrollment;

                return (
                  <button
                    key={chapter.id}
                    onClick={() => router.push(`/learn/${course.slug}/${chapter.id}`)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      isCurrent
                        ? 'bg-amber/10 border-amber'
                        : isLocked
                        ? 'bg-muted/50 border-muted opacity-60 cursor-not-allowed'
                        : 'hover:bg-muted border-transparent'
                    }`}
                    disabled={isLocked}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isCurrent
                          ? 'bg-amber text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : isLocked ? (
                          <Lock className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          isCurrent ? 'text-amber' : ''
                        }`}>
                          {index + 1}. {chapter.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDuration(chapter.duration)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Course Info */}
            <div className="mt-6 pt-6 border-t space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Chapters</span>
                <span className="font-medium">{course.chapters.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Duration</span>
                <span className="font-medium">{formatDuration(course.duration)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{course.category}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
