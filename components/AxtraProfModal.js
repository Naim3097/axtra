'use client';

import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, setDoc, doc, Timestamp } from 'firebase/firestore';
import { STATUS_TYPES } from './AxtraClientLogics';

const AxtraProfModal = ({ show, onClose, user, db, storage, onOrderAdded }) => {
  const [option, setOption] = useState(null); // 'add' or 'upload'
  const [uploading, setUploading] = useState(false);
  const [orderName, setOrderName] = useState('C16'); // Default new order name
  const [orderTitle, setOrderTitle] = useState('Static Visual Post 16'); // Default title
  const [fileRef, setFileRef] = useState(null);
  const [fileName, setFileName] = useState('');

  if (!show) return null;

  const handleAddOrder = async () => {
    if (!orderName.trim()) {
      alert('Please enter a valid order name');
      return;
    }

    setUploading(true);
    try {
      // Calculate first draft deadline (3 days from now)
      const submissionDate = new Date();
      const firstDraftDeadline = new Date(submissionDate);
      firstDraftDeadline.setDate(firstDraftDeadline.getDate() + 3);

      // Create direction document with same structure as in AxtraClientLogics
      const directionDocRef = doc(db, 'contentDirections', `${user.email.toLowerCase()}_${orderName}`);
      await setDoc(directionDocRef, {
        contentId: orderName,
        clientEmail: user.email.toLowerCase(),
        direction: '',
        fileUrl: '',
        createdAt: Timestamp.now(),
        status: STATUS_TYPES.AWAITING_DIRECTION,
        firstDraftDeadline: Timestamp.fromDate(firstDraftDeadline),
        notificationsEnabled: true,
        agencyNotified: false,
        notificationId: `direction_${user.email.toLowerCase()}_${orderName}_${Date.now()}`,
        notificationPriority: "normal"
      });

      // Create submission document with same structure as existing items
      const submissionDocRef = doc(db, 'contentSubmissions', `${user.email.toLowerCase()}_${orderName}`);
      await setDoc(submissionDocRef, {
        contentId: orderName,
        clientEmail: user.email.toLowerCase(),
        hasDirection: false,
        directionText: '',
        directionFileUrl: '',
        createdAt: Timestamp.now(),
        status: STATUS_TYPES.AWAITING_DIRECTION,
        draftNumber: 'Draft 1',
        deadlineRemindersEnabled: true,
        lastNotificationSent: null,
        reminderCount: 0,
        contentType: orderTitle,
        notificationPreferences: {
          email: true,
          inApp: true,
          deadlineWarnings: true
        }
      });

      // Inform parent component to refresh content
      if (onOrderAdded) onOrderAdded(orderName);
      onClose();
      alert(`New order ${orderName} has been added successfully!`);
    } catch (error) {
      console.error('Error adding new order:', error);
      alert(`Failed to add new order: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!fileRef) {
      alert('Please select a file to upload');
      return;
    }

    setUploading(true);
    try {
      // Upload reference file to storage
      const timestamp = Date.now();
      const fileRef = ref(storage, `fileReferences/${user.uid}/${timestamp}_${fileName}`);
      await uploadBytes(fileRef, fileRef);
      const fileUrl = await getDownloadURL(fileRef);

      // Create reference document in Firestore
      await addDoc(collection(db, 'fileReferences'), {
        clientEmail: user.email.toLowerCase(),
        fileUrl,
        fileName,
        uploadedAt: Timestamp.now(),
        notes: '',
        status: 'pending_review'
      });

      onClose();
      alert('File reference uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file reference:', error);
      alert(`Failed to upload file reference: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFileRef(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-[fadeIn_0.3s_ease-in-out_forwards] backdrop-blur-sm">
      <div className="bg-gray-900 border border-white/10 rounded-xl w-full max-w-md overflow-hidden shadow-xl transform-gpu card-hover">
        <div className="p-4 bg-gradient-to-r from-[#a898ff] to-[#da70d6] flex items-center justify-between gradient-animate">
          <h3 className="font-bold text-white">Add New Content</h3>
          <button onClick={onClose} className="text-white hover:text-white/80">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {!option ? (
            <>
              <p className="text-white/90 mb-6">What would you like to do?</p>
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => setOption('add')}
                  className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl p-4 text-left transition-all hover:transform hover:scale-[1.02] hover:shadow-lg"
                >
                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-full bg-purple-900/50 border border-purple-500/30 flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-white/90">Add New Content Item</h4>
                      <p className="text-sm text-white/70 mt-1">Create a new content item to your existing package</p>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => setOption('upload')}
                  className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl p-4 text-left transition-all hover:transform hover:scale-[1.02] hover:shadow-lg"
                >
                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-full bg-blue-900/50 border border-blue-500/30 flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-white/90">Upload Reference File</h4>
                      <p className="text-sm text-white/70 mt-1">Upload a reference file for the agency team</p>
                    </div>
                  </div>
                </button>
              </div>
            </>
          ) : option === 'add' ? (
            <>
              <h4 className="font-medium text-white/90 mb-4">Add New Order</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/70 mb-1">Order ID</label>
                  <input 
                    type="text" 
                    value={orderName}
                    onChange={(e) => setOrderName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="C16"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Content Title</label>
                  <input 
                    type="text" 
                    value={orderTitle}
                    onChange={(e) => setOrderTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="Static Visual Post 16"
                  />
                </div>
                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() => setOption(null)}
                    className="flex-1 bg-white/10 text-white px-4 py-2 rounded-lg text-sm hover:bg-white/20 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleAddOrder}
                    disabled={uploading}
                    className="flex-1 purple-gradient text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-all duration-300 gradient-animate disabled:opacity-50"
                  >
                    {uploading ? 'Processing...' : 'Add Order'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <h4 className="font-medium text-white/90 mb-4">Upload File Reference</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/70 mb-2">Select File</label>
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label 
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center justify-center text-white/70 hover:text-white/90"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      {fileName ? (
                        <span className="text-sm break-all">{fileName}</span>
                      ) : (
                        <span className="text-sm">Click to browse files</span>
                      )}
                    </label>
                  </div>
                </div>
                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() => setOption(null)}
                    className="flex-1 bg-white/10 text-white px-4 py-2 rounded-lg text-sm hover:bg-white/20 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleFileUpload}
                    disabled={uploading || !fileRef}
                    className="flex-1 purple-gradient text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-all duration-300 gradient-animate disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload File'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AxtraProfModal;
