'use client';

import { useState, useCallback } from 'react';
import { useFileUpload, FileWithPreview, formatBytes } from '@/components/ui/file-upload';
import {
    Alert,
    AlertContent,
    AlertDescription,
    AlertIcon,
    AlertTitle,
} from '@/components/ui/extended-alert';
import { Button } from '@/components/ui/extended-button';
import { TriangleAlert, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function useCopyToClipboard() {
    const [copied, setCopied] = useState(false);

    const copy = async (text: string) => {
        if (!navigator?.clipboard) return false;

        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            return true;
        } catch (error) {
            console.error('Failed to copy:', error);
            setCopied(false);
            return false;
        }
    };

    return { copy, copied };
}

interface AvatarUploadProps {
    maxSize?: number;
    className?: string;
    onFileChange?: (file: File | null) => void;
    defaultAvatar?: string;
    value?: string;
}

export default function AvatarUpload({
    maxSize = 2 * 1024 * 1024, // 2MB
    className,
    onFileChange,
    defaultAvatar,
    value
}: AvatarUploadProps) {
    const [
        { files, isDragging, errors },
        { removeFile, handleDragEnter, handleDragLeave, handleDragOver, handleDrop, openFileDialog, getInputProps },
    ] = useFileUpload({
        maxFiles: 1,
        maxSize,
        accept: 'image/*',
        multiple: false,
        onFilesChange: useCallback((files) => {
            // Correctly handling the file object for the parent component
            const file = files[0]?.file;
            if (file instanceof File) {
                onFileChange?.(file);
            } else {
                onFileChange?.(null);
            }
        }, [onFileChange]),
    });

    const currentFile = files[0];
    const previewUrl = currentFile?.preview || value || defaultAvatar;

    const handleRemove = () => {
        if (currentFile) {
            removeFile(currentFile.id);
        }
        // Also trigger onFileChange with null
        onFileChange?.(null);
    };

    return (
        <div className={cn('flex flex-col items-center gap-4', className)}>
            {/* Avatar Preview */}
            <div className="relative">
                <div
                    className={cn(
                        'group/avatar relative h-24 w-24 cursor-pointer overflow-hidden rounded-full border border-dashed transition-colors',
                        isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/20',
                        previewUrl && 'border-solid',
                    )}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={openFileDialog}
                >
                    <input {...getInputProps()} className="sr-only" />
                    {previewUrl ? (
                        <img src={previewUrl} alt="Avatar" className="h-full w-full object-cover" crossOrigin="anonymous" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <User className="size-6 text-muted-foreground" />
                        </div>
                    )}
                </div>
                {/* Remove Button - only show when file is uploaded or value exists */}
                {(currentFile || value) && (
                    <Button
                        size="icon"
                        variant="outline"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRemove();
                        }}
                        className="size-6 absolute end-0 top-0 rounded-full"
                        aria-label="Remove avatar"
                    >
                        <X className="size-3.5" />
                    </Button>
                )}
            </div>
            {/* Upload Instructions */}
            <div className="text-center space-y-0.5">
                <p className="text-sm font-medium">{currentFile ? 'Avatar uploaded' : 'Upload avatar'}</p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to {formatBytes(maxSize)}</p>
            </div>
            {/* Error Messages */}
            {errors.length > 0 && (
                <Alert variant="destructive" appearance="light" className="mt-5">
                    <AlertIcon>
                        <TriangleAlert />
                    </AlertIcon>
                    <AlertContent>
                        <AlertTitle>File upload error(s)</AlertTitle>
                        <AlertDescription>
                            {errors.map((error, index) => (
                                <p key={index} className="last:mb-0">
                                    {error}
                                </p>
                            ))}
                        </AlertDescription>
                    </AlertContent>
                </Alert>
            )}
        </div>
    );
}
