'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Requirements, requirementsConfig } from '@/lib/formRequirements';
import BaseButton from '@/components/BaseButton';
import { ClientFile } from '@/lib/types/file';

type RequirementState = 'IN_PROGRESS' | 'SUBMITTED_BY_CLIENT' | 'COMPLETE' | 'INCOMPLETE';

interface RequirementCardProps {
  requirement: Requirements;
  state: RequirementState;
  files: ClientFile[];
  filesLoading: boolean;
  onApprove: () => void;
  onReject: () => void;
  onAddFile: (requirement: Requirements) => void;
  onFileClick: (file: ClientFile) => void;
}

function RequirementCard({
  requirement,
  state,
  files,
  filesLoading,
  onApprove,
  onReject,
  onAddFile,
  onFileClick,
}: RequirementCardProps) {
  const config = requirementsConfig[requirement];

  const stateColors: Record<RequirementState, string> = {
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    SUBMITTED_BY_CLIENT: 'bg-blue-100 text-blue-800',
    COMPLETE: 'bg-green-100 text-green-800',
    INCOMPLETE: 'bg-red-100 text-red-800',
  };

  const stateLabels: Record<RequirementState, string> = {
    IN_PROGRESS: 'In Progress',
    SUBMITTED_BY_CLIENT: 'Submitted by Client',
    COMPLETE: 'Complete',
    INCOMPLETE: 'Incomplete',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{config.label}</h3>
        </div>
        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ml-4 ${stateColors[state]}`}>
          {stateLabels[state]}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <h4 className="text-sm font-medium text-gray-700">Files</h4>
          <BaseButton variant="secondary" size="xs" onClick={() => onAddFile(requirement)} className="px-2 py-1">
            +
          </BaseButton>
        </div>
        <div className="space-y-2">
          {filesLoading ? (
            <p className="text-xs text-gray-500">Loading files...</p>
          ) : files && files.length > 0 ? (
            files.map((file: ClientFile) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded border cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onFileClick(file)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">{file.url.split('/').pop() || 'File'}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(file.created_at).toLocaleDateString()}
                    {file.note && ` • ${file.note}`}
                  </p>
                </div>
                <div className="ml-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-500">No files uploaded yet</p>
          )}
        </div>
      </div>

      <div className="flex space-x-3">
        <BaseButton variant="success" size="sm" onClick={onApprove} className="flex-1">
          Complete
        </BaseButton>
        <BaseButton variant="danger" size="sm" onClick={onReject} className="flex-1">
          Mark Incomplete
        </BaseButton>
      </div>
    </div>
  );
}

interface AdminRequirementCardsContainerProps {
  clientID: string;
  onFileUploaded?: (data: {
    fileId: number;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    requirement: Requirements;
  }) => void;
}

export default function AdminRequirementCardsContainer({
  clientID,
  onFileUploaded,
}: AdminRequirementCardsContainerProps) {
  const [requirementStates, setRequirementStates] = useState<Record<Requirements, RequirementState>>(
    Object.values(Requirements).reduce(
      (acc, req) => {
        acc[req] = 'IN_PROGRESS';
        return acc;
      },
      {} as Record<Requirements, RequirementState>,
    ),
  );

  const [uploadState, setUploadState] = useState<{
    isUploading: boolean;
    error: string | null;
    uploadingRequirement: Requirements | null;
  }>({
    isUploading: false,
    error: null,
    uploadingRequirement: null,
  });

  const [files, setFiles] = useState<Record<Requirements, ClientFile[]>>(() => {
    const initialFiles: Record<Requirements, ClientFile[]> = {} as Record<Requirements, ClientFile[]>;
    Object.values(Requirements).forEach((req) => {
      initialFiles[req] = [];
    });
    return initialFiles;
  });
  const [filesLoading, setFilesLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchClientFiles = useCallback(async () => {
    setFilesLoading(true);
    try {
      const response = await fetch('/api/admin/get-client-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientID }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch files');
      }

      // Group files by requirement
      const filesByRequirement: Record<Requirements, ClientFile[]> = {} as Record<Requirements, ClientFile[]>;

      // Initialize empty arrays for all requirements
      Object.values(Requirements).forEach((req) => {
        filesByRequirement[req] = [];
      });

      // Group files by their category
      result.files.forEach((file: ClientFile) => {
        if (filesByRequirement[file.file_category as Requirements]) {
          filesByRequirement[file.file_category as Requirements].push(file);
        }
      });

      setFiles(filesByRequirement);
    } catch (error) {
      console.error('Error fetching client files:', error);
    } finally {
      setFilesLoading(false);
    }
  }, [clientID]);

  // Fetch files when component mounts or clientID changes
  useEffect(() => {
    fetchClientFiles();
  }, [fetchClientFiles]);

  const handleFileClick = async (file: ClientFile) => {
    try {
      const response = await fetch('/api/admin/get-file-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: file.id.toString() }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get file URL');
      }

      // Open the signed URL in a new tab
      window.open(result.signedUrl, '_blank');
    } catch (error) {
      console.error('Error opening file:', error);
      // Could show an error message to the user here
    }
  };

  const handleApprove = (requirement: Requirements) => {
    console.log('Complete clicked for:', requirement);
    setRequirementStates((prev) => ({
      ...prev,
      [requirement]: 'COMPLETE',
    }));
  };

  const handleReject = (requirement: Requirements) => {
    console.log('Mark Incomplete clicked for:', requirement);
    setRequirementStates((prev) => ({
      ...prev,
      [requirement]: 'INCOMPLETE',
    }));
  };

  const handleAddFile = (requirement: Requirements) => {
    console.log('Add file clicked for:', requirement, 'clientID:', clientID);
    setUploadState((prev) => ({ ...prev, error: null }));
    fileInputRef.current?.click();
    // Store which requirement we're uploading for
    setUploadState((prev) => ({ ...prev, uploadingRequirement: requirement }));
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !uploadState.uploadingRequirement) return;

    setUploadState((prev) => ({ ...prev, isUploading: true, error: null }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('clientID', clientID);
      formData.append('requirement', uploadState.uploadingRequirement);

      const response = await fetch('/api/admin/upload-file', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      console.log('File uploaded successfully:', result);

      // Refresh the files list
      await fetchClientFiles();

      // Call the callback with upload data
      if (onFileUploaded && uploadState.uploadingRequirement) {
        onFileUploaded({
          fileId: result.fileId,
          fileUrl: result.fileUrl,
          fileName: result.fileName,
          fileSize: result.fileSize,
          requirement: uploadState.uploadingRequirement,
        });
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadState((prev) => ({ ...prev, error: errorMessage }));
      console.error('Upload error:', error);
    } finally {
      setUploadState((prev) => ({ ...prev, isUploading: false, uploadingRequirement: null }));
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Requirements</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Object.values(Requirements).map((requirement) => (
          <RequirementCard
            key={`${requirement}-${clientID}`}
            requirement={requirement}
            state={requirementStates[requirement]}
            files={files[requirement] || []}
            filesLoading={filesLoading}
            onApprove={() => handleApprove(requirement)}
            onReject={() => handleReject(requirement)}
            onAddFile={handleAddFile}
            onFileClick={handleFileClick}
          />
        ))}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Upload status overlay */}
      {uploadState.isUploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Uploading file...</span>
            </div>
          </div>
        </div>
      )}

      {/* Error notification */}
      {uploadState.error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50">
          <div className="flex items-center">
            <span className="mr-2">⚠️</span>
            <span>{uploadState.error}</span>
            <button
              onClick={() => setUploadState((prev) => ({ ...prev, error: null }))}
              className="ml-4 text-red-700 hover:text-red-900"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
