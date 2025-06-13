import { useState, useCallback, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortablePDFItem } from './SortablePDFItem';

export function PDFMerger() {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [isMerging, setIsMerging] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrls, setPreviewUrls] = useState({});
  const [addBlankPages, setAddBlankPages] = useState(false);
  const [outputFileName, setOutputFileName] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setPdfFiles((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const createPreviewUrl = useCallback(async (file) => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      setPreviewUrls(prev => ({ ...prev, [file.name]: url }));
      resolve(url);
    });
  }, []);

  const handleFileChange = useCallback(async (event) => {
    const files = event.target.files;
    if (!files) return;

    try {
      // Process all files first
      const newFiles = Array.from(files)
        .filter(file => file.type === 'application/pdf')
        .map(file => ({
          id: Math.random().toString(36).substr(2, 9),
          file,
          name: file.name,
          size: file.size,
        }));

      // Create preview URLs for all files
      const previewPromises = newFiles.map(({ file }) => createPreviewUrl(file));
      await Promise.all(previewPromises);

      // Update state with all new files
      setPdfFiles(prev => [...prev, ...newFiles]);
      setError(null);
    } catch (err) {
      console.error('Error processing files:', err);
      setError('Error processing files. Please try again.');
    }
  }, [createPreviewUrl]);

  const removeFile = useCallback((id) => {
    console.log('Removing file with id:', id); // Debug log
    setPdfFiles(prev => {
      const fileToRemove = prev.find(file => file.id === id);
      if (fileToRemove) {
        // Revoke the preview URL when removing a file
        if (previewUrls[fileToRemove.name]) {
          URL.revokeObjectURL(previewUrls[fileToRemove.name]);
        }
        setPreviewUrls(prev => {
          const newUrls = { ...prev };
          delete newUrls[fileToRemove.name];
          return newUrls;
        });
      }
      return prev.filter(file => file.id !== id);
    });
  }, [previewUrls]);

  const mergePDFs = async () => {
    if (pdfFiles.length === 0) {
      setError('Please upload at least one PDF file');
      return;
    }

    setIsMerging(true);
    setError(null);

    try {
      const mergedPdf = await PDFDocument.create();

      for (let i = 0; i < pdfFiles.length; i++) {
        const pdfFile = pdfFiles[i];
        const fileArrayBuffer = await pdfFile.file.arrayBuffer();
        const pdf = await PDFDocument.load(fileArrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
        
        // Add blank page after each PDF (except the last one) if toggle is enabled
        if (addBlankPages && i < pdfFiles.length - 1) {
          const blankPage = mergedPdf.addPage();
          // Set the page size to match the first page of the current PDF
          const firstPage = pdf.getPage(0);
          const { width, height } = firstPage.getSize();
          blankPage.setSize(width, height);
        }
      }

      const mergedPdfFile = await mergedPdf.save();
      
      // Create a download link
      const blob = new Blob([mergedPdfFile], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Use custom filename or default to "merged.pdf"
      const fileName = outputFileName.trim() || 'merged.pdf';
      // Ensure the filename ends with .pdf
      const finalFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
      link.download = finalFileName;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Error merging PDFs. Please try again.');
      console.error('Error merging PDFs:', err);
    } finally {
      setIsMerging(false);
    }
  };

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      Object.values(previewUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  return (
    <div className="flex w-full h-screen">
      {/* Left side - File list and controls */}
      <div className="w-1/2 p-6 border-r border-gray-200 overflow-y-auto">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">PDF Merger</h1>
            <p className="mt-2 text-gray-600">Upload and merge your PDF files</p>
          </div>

          <div className="flex flex-col items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PDF files only</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".pdf"
                multiple
                onChange={handleFileChange}
              />
            </label>
          </div>

          {error && (
            <div className="p-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
              {error}
            </div>
          )}

          {pdfFiles.length > 0 && (
            <div className="space-y-4">
              {/* Blank page toggle */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="blankPages"
                      checked={addBlankPages}
                      onChange={(e) => setAddBlankPages(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label htmlFor="blankPages" className="text-sm font-medium text-gray-700">
                      Add blank page between each PDF
                    </label>
                  </div>
                  {addBlankPages && (
                    <span className="text-xs text-gray-500">
                      {pdfFiles.length > 1 ? `${pdfFiles.length - 1} blank page(s) will be added` : 'No blank pages needed'}
                    </span>
                  )}
                </div>

                {/* Output filename input */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label htmlFor="outputFileName" className="block text-sm font-medium text-gray-700 mb-2">
                    Output filename
                  </label>
                  <input
                    type="text"
                    id="outputFileName"
                    value={outputFileName}
                    onChange={(e) => setOutputFileName(e.target.value)}
                    placeholder="merged.pdf"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Leave blank to use "merged.pdf" as the default filename
                  </p>
                </div>
              </div>

              {/* PDF Files - Drag and reorder section */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">PDF Files</h2>
                <p className="text-sm text-gray-600">Drag and drop to reorder files</p>
                
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={pdfFiles.map(file => file.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {pdfFiles.map((file) => (
                        <SortablePDFItem
                          key={file.id}
                          id={file.id}
                          name={file.name}
                          size={file.size}
                          onRemove={() => removeFile(file.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setPdfFiles([]);
                      // Clean up all preview URLs
                      Object.values(previewUrls).forEach(url => URL.revokeObjectURL(url));
                      setPreviewUrls({});
                    }}
                    className="btn btn-secondary"
                    disabled={isMerging}
                  >
                    Clear All
                  </button>
                  <button
                    onClick={mergePDFs}
                    className="btn btn-primary"
                    disabled={isMerging}
                  >
                    {isMerging ? 'Merging...' : 'Merge PDFs'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side - PDF previews */}
      <div className="w-1/2 p-6 bg-gray-50 overflow-y-auto">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">PDF Previews</h2>
        <div className="space-y-4">
          {pdfFiles.map((file) => (
            <div key={file.id} className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">{file.name}</h3>
              <div className="aspect-[3/4] w-full border border-gray-200 rounded-lg overflow-hidden">
                <iframe
                  src={previewUrls[file.name]}
                  className="w-full h-full"
                  title={`Preview of ${file.name}`}
                />
              </div>
            </div>
          ))}
          {pdfFiles.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              Upload PDF files to see previews
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 