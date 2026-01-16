import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMessage } from '@/context/MessageContext';

export function ImageUpload({ value, onChange, className, bucket = 'event-images', disabled }) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const { showMessage } = useMessage();

    const handleUpload = async (event) => {
        try {
            const file = event.target.files?.[0];
            if (!file) return;

            setUploading(true);

            // 1. Unique file name
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // 2. Upload to Supabase
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // 3. Get Public URL
            const { data } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            onChange(data.publicUrl);
            showMessage('Image uploaded successfully!', { type: 'success' });

        } catch (error) {
            console.error("Upload error:", error);
            showMessage('Error uploading image. Make sure the bucket exists and is public.', { type: 'error' });
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemove = () => {
        onChange('');
    };

    return (
        <div className={cn("space-y-4 w-full", className)}>
            <div className="flex items-center gap-4">
                {value ? (
                    <div className="relative w-full h-[200px] rounded-xl overflow-hidden border border-slate-200 group">
                        <img
                            src={value}
                            alt="Upload"
                            className="object-cover w-full h-full"
                        />
                        {!disabled && (
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                ) : (
                    <div
                        onClick={() => !disabled && fileInputRef.current?.click()}
                        className={cn(
                            "w-full h-[200px] border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-slate-100/50 transition-colors",
                            disabled && "opacity-50 cursor-not-allowed hover:border-slate-200 hover:bg-slate-50"
                        )}
                    >
                        {uploading ? (
                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        ) : (
                            <>
                                <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                                    <Upload className="h-5 w-5 text-slate-500" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium text-slate-700">Click to upload image</p>
                                    <p className="text-xs text-slate-400 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                                </div>
                            </>
                        )}
                    </div>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleUpload}
                    disabled={disabled || uploading}
                />
            </div>
        </div>
    );
}
