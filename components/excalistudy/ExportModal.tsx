"use client";

import React, { useState } from "react";
import { X, Image as ImageIcon, Download, Share2 } from "lucide-react";

type ExportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  previewDataUrl: string | null;
  onDownload: (fileName: string) => void;
  onShare: (fileName: string) => void;
  defaultName?: string;
  isSavingProject?: boolean;
  onSaveProject?: (fileName: string) => void;
};

export function ExportModal({ 
  isOpen, 
  onClose, 
  previewDataUrl, 
  onDownload, 
  onShare, 
  defaultName = "Excalidraw-Export",
  isSavingProject = false,
  onSaveProject
}: ExportModalProps) {
  const [fileName, setFileName] = useState(defaultName);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-card w-full max-w-md rounded-xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
      >
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-muted-foreground" />
            {isSavingProject ? "Save Current Canvas" : "Export Screen"}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:bg-black/5 hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {!isSavingProject && previewDataUrl ? (
            <div className="w-full aspect-video rounded-lg overflow-hidden border border-border shadow-inner bg-muted relative group">
              {/* Using a standard img tag because next/image requires width/height and these are dynamic base64 */}
              <img 
                src={previewDataUrl} 
                alt="Preview" 
                className="w-full h-full object-contain"
              />
            </div>
          ) : !isSavingProject ? (
            <div className="w-full aspect-video rounded-lg border border-border border-dashed flex items-center justify-center bg-muted/50 text-muted-foreground">
              Generating preview...
            </div>
          ) : null}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              {isSavingProject ? "Project Name" : "File Name"}
            </label>
            <input 
              type="text" 
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full p-2 border border-input rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm"
              placeholder="e.g. Math Study Plan"
              autoFocus
            />
          </div>
        </div>

        <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-end gap-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-black/5 rounded-md transition-colors"
          >
            Cancel
          </button>

          {isSavingProject ? (
            <button 
              onClick={() => onSaveProject?.(fileName)}
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md shadow-sm hover:bg-primary/90 flex items-center gap-2 transition-colors"
            >
              Save Project
            </button>
          ) : (
            <>
              {typeof navigator !== "undefined" && 'share' in navigator && (
                <button 
                  onClick={() => onShare(fileName)}
                  className="px-4 py-2 text-sm font-medium border border-border bg-card text-foreground rounded-md shadow-sm hover:bg-muted focus:outline-none flex items-center gap-2 transition-colors"
                  disabled={!previewDataUrl}
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
              )}
              <button 
                onClick={() => onDownload(fileName)}
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md shadow-sm hover:bg-primary/90 flex items-center gap-2 transition-colors"
                disabled={!previewDataUrl}
              >
                <Download className="w-4 h-4" /> Download PNG
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

