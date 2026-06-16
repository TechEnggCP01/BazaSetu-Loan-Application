import React, { useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDropzone } from 'react-dropzone';
import SignatureCanvas from 'react-signature-canvas';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Upload, X, FileText, RotateCcw, Check, PenTool } from 'lucide-react';
import { documentsSchema, type DocumentsFormData } from '../../lib/schemas';
import { useLoanStore } from '../../store/loanStore';
import { Button } from '../../components/ui/Button';
import { FadeIn } from '../../components/ui/StepTransition';
import { fileToDataUrl, formatFileSize } from '../../lib/utils';
import type { UploadedFile } from '../../types/loan';

interface Step7Props { onNext: () => void; onBack: () => void; }

interface FileUploaderProps {
  label: string;
  hint?: string;
  value?: UploadedFile;
  onChange: (file: UploadedFile | undefined) => void;
  accept?: Record<string, string[]>;
  maxSizeMB?: number;
}

const FileUploader: React.FC<FileUploaderProps> = ({ label, hint, value, onChange, accept, maxSizeMB = 5 }) => {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    if (file.size > maxSizeMB * 1024 * 1024) return;

    setUploading(true);
    setProgress(0);
    // Simulate upload progress
    const interval = setInterval(() => setProgress((p) => Math.min(p + 20, 100)), 200);
    const dataUrl = await fileToDataUrl(file);
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setUploading(false);
      onChange({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl,
        uploadedAt: new Date().toISOString(),
      });
    }, 1100);
  }, [onChange, maxSizeMB]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ?? {
      'image/*': ['.jpg', '.jpeg', '.png'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div className="w-full">
      <p className="text-sm font-medium text-slate-700 mb-1.5">{label}</p>
      {hint && <p className="text-xs text-slate-400 mb-2">{hint}</p>}

      {value ? (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3 flex items-center gap-3"
          >
            {value.type.startsWith('image/') ? (
              <img src={value.dataUrl} alt={value.name} className="w-12 h-12 rounded-lg object-cover border border-slate-200 flex-shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-red-500" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">{value.name}</p>
              <p className="text-xs text-slate-400">{formatFileSize(value.size)}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge-verified"><Check className="w-3 h-3" /> Uploaded</span>
              <button
                type="button"
                onClick={() => onChange(undefined)}
                className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                aria-label="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      ) : (
        <div {...getRootProps()} className={`upload-zone ${isDragActive ? 'upload-zone-active' : ''}`}>
          <input {...getInputProps()} aria-label={`Upload ${label}`} />
          {uploading ? (
            <div className="w-full">
              <p className="text-sm text-brand-600 font-medium text-center mb-2">Uploading...</p>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full gradient-brand rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-sm text-slate-500 font-medium">
                {isDragActive ? 'Drop here' : 'Drop file or click to browse'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">PDF, JPG, PNG · Max {maxSizeMB}MB</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export const Step7Documents: React.FC<Step7Props> = ({ onNext, onBack }) => {
  const { documents, updateDocuments, markStepComplete } = useLoanStore();
  const sigCanvasRef = useRef<SignatureCanvas>(null);
  const [sigSaved, setSigSaved] = useState(!!documents.signatureDataUrl);
  const [sigPreview, setSigPreview] = useState<string | undefined>(documents.signatureDataUrl);

  const [localDocs, setLocalDocs] = useState({
    panCard: documents.panCard,
    aadhaarCard: documents.aadhaarCard,
    utilityBill: documents.utilityBill,
    passport: documents.passport,
    salarySlip: documents.salarySlip,
    bankStatement: documents.bankStatement,
    itr: documents.itr,
  });

  const { handleSubmit, setValue, formState: { errors } } = useForm<DocumentsFormData>({
    resolver: zodResolver(documentsSchema),
    defaultValues: {
      signatureDataUrl: documents.signatureDataUrl ?? '',
    },
  });

  const handleSaveSignature = () => {
    if (sigCanvasRef.current?.isEmpty()) return;
    const dataUrl = sigCanvasRef.current?.toDataURL('image/png');
    setSigPreview(dataUrl);
    setSigSaved(true);
    setValue('signatureDataUrl', dataUrl ?? '');
  };

  const handleClearSignature = () => {
    sigCanvasRef.current?.clear();
    setSigSaved(false);
    setSigPreview(undefined);
    setValue('signatureDataUrl', '');
  };

  const updateDoc = <K extends keyof typeof localDocs>(key: K, value: (typeof localDocs)[K]) => {
    setLocalDocs((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = (data: DocumentsFormData) => {
    updateDocuments({ ...localDocs, signatureDataUrl: data.signatureDataUrl });
    markStepComplete(7);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FadeIn>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Documents & Signature</h2>
          <p className="text-sm text-slate-400">Upload your documents and provide your signature</p>
        </div>

        {/* Identity Proof */}
        <div className="step-card mb-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold">1</span>
            Identity Proof
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FileUploader
              label="PAN Card"
              hint="Clear photo or scanned copy"
              value={localDocs.panCard}
              onChange={(f) => updateDoc('panCard', f)}
            />
            <FileUploader
              label="Aadhaar Card"
              hint="Front and back in one image"
              value={localDocs.aadhaarCard}
              onChange={(f) => updateDoc('aadhaarCard', f)}
            />
          </div>
        </div>

        {/* Address Proof */}
        <div className="step-card mb-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold">2</span>
            Address Proof
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FileUploader
              label="Utility Bill"
              hint="Electricity / Water / Gas (within 3 months)"
              value={localDocs.utilityBill}
              onChange={(f) => updateDoc('utilityBill', f)}
            />
            <FileUploader
              label="Passport (if available)"
              hint="Photo page only"
              value={localDocs.passport}
              onChange={(f) => updateDoc('passport', f)}
            />
          </div>
        </div>

        {/* Income Proof */}
        <div className="step-card mb-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold">3</span>
            Income Proof
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FileUploader
              label="Salary Slip"
              hint="Last 3 months"
              value={localDocs.salarySlip}
              onChange={(f) => updateDoc('salarySlip', f)}
            />
            <FileUploader
              label="Bank Statement"
              hint="Last 6 months"
              value={localDocs.bankStatement}
              onChange={(f) => updateDoc('bankStatement', f)}
            />
            <FileUploader
              label="ITR / Tax Return"
              hint="Last 2 years (for business applicants)"
              value={localDocs.itr}
              onChange={(f) => updateDoc('itr', f)}
            />
          </div>
        </div>

        {/* Signature Section */}
        <div className="step-card mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold">4</span>
            E-Signature <span className="text-xs font-normal text-red-500">*</span>
          </h3>

          {sigSaved && sigPreview ? (
            <div className="border-2 border-emerald-200 rounded-xl overflow-hidden">
              <div className="bg-emerald-50 px-4 py-2 flex items-center justify-between">
                <span className="badge-verified"><Check className="w-3 h-3" /> Signature Saved</span>
                <button
                  type="button"
                  onClick={handleClearSignature}
                  className="btn-ghost text-xs flex items-center gap-1 text-red-500 hover:bg-red-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Re-sign
                </button>
              </div>
              <div className="bg-white p-4 flex justify-center">
                <img src={sigPreview} alt="Your signature" className="max-h-24 object-contain" />
              </div>
            </div>
          ) : (
            <div>
              <div className="border-2 border-dashed border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-2 bg-white">
                  <PenTool className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-400">Sign in the area below using mouse or touch</span>
                </div>
                <SignatureCanvas
                  ref={sigCanvasRef}
                  penColor="#1e3a5f"
                  canvasProps={{
                    className: 'w-full',
                    style: { height: 150, display: 'block' },
                    'aria-label': 'Signature canvas',
                  }}
                />
              </div>
              {errors.signatureDataUrl && (
                <p className="text-xs text-red-600 mt-1">{errors.signatureDataUrl.message}</p>
              )}
              <div className="flex gap-2 mt-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClearSignature}
                  icon={<RotateCcw className="w-4 h-4" />}
                >
                  Clear
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSaveSignature}
                  icon={<Check className="w-4 h-4" />}
                >
                  Save Signature
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={onBack} icon={<ChevronLeft className="w-4 h-4" />}>
            Back
          </Button>
          <Button type="submit" className="flex-1" size="lg" icon={<ChevronRight className="w-5 h-5" />}>
            Review Application
          </Button>
        </div>
      </FadeIn>
    </form>
  );
};
