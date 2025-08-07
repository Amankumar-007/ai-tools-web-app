// // pages/index.js
// "use client"
// import { useState, useRef } from 'react';
// import ImageKit from 'imagekit-javascript';
// import { GoogleGenerativeAI } from "@google/generative-ai";

// export default function ThumbnailGenerator() {
//   const [file, setFile] = useState(null);
//   const [prompt, setPrompt] = useState('');
//   const [generatedPrompt, setGeneratedPrompt] = useState('');
//   const [generatedImage, setGeneratedImage] = useState('');
//   const [progress, setProgress] = useState(0);
//   const fileInputRef = useRef(null);

//   // Initialize ImageKit
//   const imagekit = new ImageKit({
//     publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
//     urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
//     privateKey: process.env.IMAGEKIT_PRIVATE_KEY
//   });

//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//   };

//   const uploadImage = async () => {
//     if (!file) return;
    
//     setProgress(10);
//     try {
//       const response = await imagekit.upload({
//         file: file,
//         fileName: file.name,
//         folder: "/thumbnails/reference"
//       });
      
//       setProgress(30);
//       return response.url;
//     } catch (error) {
//       console.error("Upload failed:", error);
//       return null;
//     }
//   };

//   const generateAIPrompt = async (imageUrl = null) => {
//     setProgress(50);
    
//     // Using Gemini (you can replace with OpenAI if preferred)
//     const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
//     const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
//     const instruction = "Generate a creative thumbnail prompt based on ";
//     const input = imageUrl 
//       ? `${instruction} this image: ${imageUrl} and user input: ${prompt}`
//       : `${instruction} this user input: ${prompt}`;
    
//     const result = await model.generateContent(input);
//     const generatedText = await result.response.text();
    
//     setGeneratedPrompt(generatedText);
//     setProgress(70);
//     return generatedText;
//   };

//   const generateThumbnail = async () => {
//     setProgress(20);
//     const imageUrl = await uploadImage();
    
//     setProgress(40);
//     const aiPrompt = await generateAIPrompt(imageUrl);
    
//     setProgress(80);
//     // Here you would call your AI image generation service
//     // This is a placeholder - you'd use OpenAI's DALL-E or another service
//     const generatedImageUrl = await generateImageWithAI(aiPrompt);
    
//     setGeneratedImage(generatedImageUrl);
//     setProgress(100);
//   };

//   const generateImageWithAI = async (prompt) => {
//     // Implement with your preferred AI image generation service
//     // Example with OpenAI:
//     // const response = await openai.images.generate({
//     //   prompt: prompt,
//     //   n: 1,
//     //   size: "1024x1024",
//     // });
//     // return response.data[0].url;
    
//     // For now, return a placeholder
//     return "https://via.placeholder.com/1024";
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-3xl font-bold mb-6">AI Thumbnail Generator</h1>
      
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//         {/* Input Section */}
//         <div className="bg-gray-100 p-6 rounded-lg">
//           <h2 className="text-xl font-semibold mb-4">Input</h2>
          
//           <div className="mb-4">
//             <label className="block mb-2">Reference Image (Optional)</label>
//             <input 
//               type="file" 
//               onChange={handleFileChange}
//               ref={fileInputRef}
//               className="w-full p-2 border rounded"
//             />
//           </div>
          
//           <div className="mb-4">
//             <label className="block mb-2">Prompt Ideas</label>
//             <textarea
//               value={prompt}
//               onChange={(e) => setPrompt(e.target.value)}
//               className="w-full p-2 border rounded h-24"
//               placeholder="Describe the thumbnail you want..."
//             />
//           </div>
          
//           <button
//             onClick={generateThumbnail}
//             className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//           >
//             Generate Thumbnail
//           </button>
          
//           {progress > 0 && (
//             <div className="mt-4">
//               <div className="w-full bg-gray-200 rounded-full h-2.5">
//                 <div 
//                   className="bg-blue-600 h-2.5 rounded-full" 
//                   style={{ width: `${progress}%` }}
//                 ></div>
//               </div>
//               <p className="text-sm mt-1">Progress: {progress}%</p>
//             </div>
//           )}
//         </div>
        
//         {/* Output Section */}
//         <div className="bg-gray-100 p-6 rounded-lg">
//           <h2 className="text-xl font-semibold mb-4">Output</h2>
          
//           {generatedPrompt && (
//             <div className="mb-4">
//               <label className="block mb-2">Generated AI Prompt</label>
//               <div className="p-3 bg-white border rounded">
//                 {generatedPrompt}
//               </div>
//             </div>
//           )}
          
//           {generatedImage && (
//             <div>
//               <label className="block mb-2">Generated Thumbnail</label>
//               <img 
//                 src={generatedImage} 
//                 alt="Generated thumbnail"
//                 className="w-full border rounded"
//               />
//               <div className="mt-2 flex justify-end">
//                 <a 
//                   href={generatedImage} 
//                   download="thumbnail.png"
//                   className="bg-green-500 text-white px-3 py-1 rounded text-sm"
//                 >
//                   Download
//                 </a>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }