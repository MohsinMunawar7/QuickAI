
import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import {v2 as cloudinary} from "cloudinary";
import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);
// const pdfParse = require('pdf-parse');
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const workerPath = join(
    __dirname,
    '../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs'
);

pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;




const AI = new OpenAI({

    apiKey: process.env.GEMINI_API_KEY,

    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});









export const generateArticle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt, length } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Limit reached. Upgrade to continue." })
        }

        const response = await AI.chat.completions.create({
            model: "gemini-3-flash-preview",
            messages: [{
                role: "user",
                content: prompt,
            }],
            temperature: 0.7,
            max_tokens: length,
        });

        const content = response.choices[0].message.content;

        // ✅ Add validation before inserting
        if (!content || content.trim() === '') {
            return res.json({ 
                success: false, 
                message: "Failed to generate content. Please try again." 
            });
        }

        await sql`INSERT INTO creations (user_id, prompt, content, type)
                  VALUES(${userId}, ${prompt}, ${content}, 'article')`;

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            })
        }

        res.json({ success: true, content })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}











export const generateBlogTitle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Limit reached. Upgrade to continue." })
        }

        // ✅ More explicit prompt with formatting instructions
        const enhancedPrompt = `You are an expert blog title generator. Generate exactly 5 complete, creative blog titles.

${prompt}

CRITICAL FORMATTING RULES:
- Put each title on a separate line
- Use a line break (newline) between each title
- Do NOT number the titles
- Do NOT use bullets
- Just the titles, one per line

Generate all 5 titles now:`;

        const response = await AI.chat.completions.create({
            model: "gemini-3-flash-preview",
            messages: [
                {
                    role: "user",
                    content: enhancedPrompt,
                }
            ],
            temperature: 0.8,
            max_tokens: 2000,
        });

        let content = response.choices[0].message.content?.trim();

        // ✅ Post-process to ensure proper line breaks
        if (content) {
            // Remove any numbering (1., 2., etc.)
            content = content.replace(/^\d+\.\s*/gm, '');
            // Remove bullet points
            content = content.replace(/^[-*•]\s*/gm, '');
            // Ensure double line breaks between titles for better readability
            content = content.split('\n')
                .filter(line => line.trim().length > 0)
                .join('\n\n');
        }

        // Debug logging
        console.log('=== TITLE GENERATION DEBUG ===');
        console.log('Generated content:', content);
        console.log('Content length:', content?.length);
        console.log('Number of lines:', content?.split('\n').filter(line => line.trim()).length);
        console.log('Finish reason:', response.choices[0].finish_reason);
        console.log('==============================');

        if (!content || content.length < 10) {
            return res.json({ 
                success: false, 
                message: "Failed to generate titles. Please try again." 
            });
        }

        await sql`INSERT INTO creations (user_id, prompt, content, type)
                  VALUES(${userId}, ${prompt}, ${content}, 'blog-title')`;

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            })
        }

        res.json({ success: true, content })

    } catch (error) {
        console.log('Error in generateBlogTitle:', error.message)
        res.json({ success: false, message: error.message })
    }
}




export const generateImage = async (req,res) => {
    try{

        const {userId} = req.auth();
        const {prompt,publish} = req.body;
        const plan = req.plan;

        if(plan !== 'premium'){
            return res.json({success:false,message:"This feature is only available for premium subscriptions"})
        }
        const formData = new FormData()
        formData.append('prompt', prompt)
        const {data} = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData,{
            headers:{'x-api-key': process.env.CLIPDROP_API_KEY,},
            responseType:"arraybuffer",
        } )

        const base64Image = `data:image/png;base64,${Buffer.from(data,'binary').toString('base64')}`;
        const{secure_url}= await cloudinary.uploader.upload(base64Image)








await sql` INSERT INTO creations (user_id,prompt,content,type,publish)
VALUES(${userId},${prompt},${secure_url},'image',${publish ?? false})`;


res.json({success:true,content:secure_url})


    }
    catch(error){
        console.log(error.message)
        res.json({success:false, message: error.message})

    }
}








export const removeImageBackground = async (req,res) => {
    try{


        const {userId} = req.auth();
        const image = req.file;
        const plan = req.plan;

        if(plan !== 'premium'){
            return res.json({success:false,message:"This feature is only available for premium subscriptions"})
        }


        const{secure_url}= await cloudinary.uploader.upload(image.path,{
            transformation:[
                {
                    effect:'background_removal',
                    background_removal:'remove_the_background'

            }
        ]
    })

await sql` INSERT INTO creations (user_id,prompt,content,type)
VALUES(${userId},'Remove background from image',${secure_url},'image')`;


res.json({success:true,content:secure_url})


    }
    catch(error){
        console.log(error.message)
        res.json({success:false, message: error.message})

    }
}








export const removeImageObject = async (req,res) => {
    try{


        const {userId} = req.auth();
        const {object} = req.body;
        const image = req.file;
        const plan = req.plan;

        if(plan !== 'premium'){
            return res.json({success:false,message:"This feature is only available for premium subscriptions"})
        }
        const{public_id}= await cloudinary.uploader.upload(image.path)

         const imageUrl = cloudinary.url(public_id,{
            transformation:[{effect:`gen_remove:${object}`}],
            resource_type:'image'


        })


await sql` INSERT INTO creations (user_id,prompt,content,type)
VALUES(${userId},${`Removed ${object} from image`},${imageUrl},'image')`;


res.json({success:true, content: imageUrl})




    }
    catch(error){
        console.log(error.message)
        res.json({success:false, message: error.message})

    }
}

















export const resumeReview = async (req, res) => {
    try {
        const { userId } = req.auth();
        const resume = req.file;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium subscriptions" })
        }

        if (resume.size > 5 * 1024 * 1024) {
            return res.json({ success: false, message: "Resume file size exceeds allowed size(5MB)." })
        }

        // Read PDF file
        const dataBuffer = fs.readFileSync(resume.path);
        
        // Load PDF document
        const loadingTask = pdfjsLib.getDocument({
            data: new Uint8Array(dataBuffer),
            useSystemFonts: true,
        });
        
        const pdfDocument = await loadingTask.promise;
        const numPages = pdfDocument.numPages;
        
        let pdfText = '';
        
        // Extract text from each page
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const page = await pdfDocument.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            pdfText += pageText + '\n';
        }

        console.log("Extracted PDF Text Length:", pdfText.length);
        console.log("First 300 chars:", pdfText.substring(0, 300));

        // Check if text was extracted
        if (!pdfText || pdfText.trim().length < 50) {
            return res.json({ 
                success: false, 
                message: "Could not extract text from the PDF. Please ensure the resume is a text-based PDF, not a scanned image." 
            });
        }

        const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement. Resume Content:\n\n${pdfText}`;

        const response = await AI.chat.completions.create({
            model: "gemini-3-flash-preview",
            messages: [{
                role: "user",
                content: prompt,
            }],
            temperature: 0.7,
            max_tokens: 1500,
        });

        const content = response.choices[0].message.content;

        await sql`INSERT INTO creations (user_id, prompt, content, type)
                  VALUES(${userId}, 'Review the uploaded resume', ${content}, 'resume-review')`;

        res.json({ success: true, content })

    } catch (error) {
        console.log("Resume Review Error:", error.message, error.stack)
        res.json({ success: false, message: error.message })
    }
}













// import OpenAI from "openai";
// import sql from "../configs/db.js";
// import { clerkClient } from "@clerk/express";
// import axios from "axios";
// import {v2 as cloudinary} from "cloudinary";
// import fs from 'fs';
// import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

// // ✅ Disable worker for serverless environment
// pdfjsLib.GlobalWorkerOptions.workerSrc = null;

// const AI = new OpenAI({
//     apiKey: process.env.GEMINI_API_KEY,
//     baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
// });


// export const generateArticle = async (req, res) => {
//     try {
//         const { userId } = req.auth();
//         const { prompt, length } = req.body;
//         const plan = req.plan;
//         const free_usage = req.free_usage;

//         if (plan !== 'premium' && free_usage >= 10) {
//             return res.json({ success: false, message: "Limit reached. Upgrade to continue." })
//         }

//         const response = await AI.chat.completions.create({
//             model: "gemini-3-flash-preview",
//             messages: [{
//                 role: "user",
//                 content: prompt,
//             }],
//             temperature: 0.7,
//             max_tokens: length,
//         });

//         const content = response.choices[0].message.content;

//         // ✅ Add validation before inserting
//         if (!content || content.trim() === '') {
//             return res.json({ 
//                 success: false, 
//                 message: "Failed to generate content. Please try again." 
//             });
//         }

//         await sql`INSERT INTO creations (user_id, prompt, content, type)
//                   VALUES(${userId}, ${prompt}, ${content}, 'article')`;

//         if (plan !== 'premium') {
//             await clerkClient.users.updateUserMetadata(userId, {
//                 privateMetadata: {
//                     free_usage: free_usage + 1
//                 }
//             })
//         }

//         res.json({ success: true, content })

//     } catch (error) {
//         console.log(error.message)
//         res.json({ success: false, message: error.message })
//     }
// }


// export const generateBlogTitle = async (req, res) => {
//     try {
//         const { userId } = req.auth();
//         const { prompt } = req.body;
//         const plan = req.plan;
//         const free_usage = req.free_usage;

//         if (plan !== 'premium' && free_usage >= 10) {
//             return res.json({ success: false, message: "Limit reached. Upgrade to continue." })
//         }

//         // ✅ More explicit prompt with formatting instructions
//         const enhancedPrompt = `You are an expert blog title generator. Generate exactly 5 complete, creative blog titles.

// ${prompt}

// CRITICAL FORMATTING RULES:
// - Put each title on a separate line
// - Use a line break (newline) between each title
// - Do NOT number the titles
// - Do NOT use bullets
// - Just the titles, one per line

// Generate all 5 titles now:`;

//         const response = await AI.chat.completions.create({
//             model: "gemini-3-flash-preview",
//             messages: [
//                 {
//                     role: "user",
//                     content: enhancedPrompt,
//                 }
//             ],
//             temperature: 0.8,
//             max_tokens: 2000,
//         });

//         let content = response.choices[0].message.content?.trim();

//         // ✅ Post-process to ensure proper line breaks
//         if (content) {
//             // Remove any numbering (1., 2., etc.)
//             content = content.replace(/^\d+\.\s*/gm, '');
//             // Remove bullet points
//             content = content.replace(/^[-*•]\s*/gm, '');
//             // Ensure double line breaks between titles for better readability
//             content = content.split('\n')
//                 .filter(line => line.trim().length > 0)
//                 .join('\n\n');
//         }

//         // Debug logging
//         console.log('=== TITLE GENERATION DEBUG ===');
//         console.log('Generated content:', content);
//         console.log('Content length:', content?.length);
//         console.log('Number of lines:', content?.split('\n').filter(line => line.trim()).length);
//         console.log('Finish reason:', response.choices[0].finish_reason);
//         console.log('==============================');

//         if (!content || content.length < 10) {
//             return res.json({ 
//                 success: false, 
//                 message: "Failed to generate titles. Please try again." 
//             });
//         }

//         await sql`INSERT INTO creations (user_id, prompt, content, type)
//                   VALUES(${userId}, ${prompt}, ${content}, 'blog-title')`;

//         if (plan !== 'premium') {
//             await clerkClient.users.updateUserMetadata(userId, {
//                 privateMetadata: {
//                     free_usage: free_usage + 1
//                 }
//             })
//         }

//         res.json({ success: true, content })

//     } catch (error) {
//         console.log('Error in generateBlogTitle:', error.message)
//         res.json({ success: false, message: error.message })
//     }
// }


// export const generateImage = async (req,res) => {
//     try{
//         const {userId} = req.auth();
//         const {prompt,publish} = req.body;
//         const plan = req.plan;

//         if(plan !== 'premium'){
//             return res.json({success:false,message:"This feature is only available for premium subscriptions"})
//         }
        
//         const formData = new FormData()
//         formData.append('prompt', prompt)
//         const {data} = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData,{
//             headers:{'x-api-key': process.env.CLIPDROP_API_KEY,},
//             responseType:"arraybuffer",
//         })

//         const base64Image = `data:image/png;base64,${Buffer.from(data,'binary').toString('base64')}`;
//         const{secure_url}= await cloudinary.uploader.upload(base64Image)

//         await sql`INSERT INTO creations (user_id,prompt,content,type,publish)
//                   VALUES(${userId},${prompt},${secure_url},'image',${publish ?? false})`;

//         res.json({success:true,content:secure_url})

//     } catch(error){
//         console.log(error.message)
//         res.json({success:false, message: error.message})
//     }
// }


// export const removeImageBackground = async (req,res) => {
//     try{
//         const {userId} = req.auth();
//         const image = req.file;
//         const plan = req.plan;

//         if(plan !== 'premium'){
//             return res.json({success:false,message:"This feature is only available for premium subscriptions"})
//         }

//         const{secure_url}= await cloudinary.uploader.upload(image.path,{
//             transformation:[{
//                 effect:'background_removal',
//                 background_removal:'remove_the_background'
//             }]
//         })

//         await sql`INSERT INTO creations (user_id,prompt,content,type)
//                   VALUES(${userId},'Remove background from image',${secure_url},'image')`;

//         res.json({success:true,content:secure_url})

//     } catch(error){
//         console.log(error.message)
//         res.json({success:false, message: error.message})
//     }
// }


// export const removeImageObject = async (req,res) => {
//     try{
//         const {userId} = req.auth();
//         const {object} = req.body;
//         const image = req.file;
//         const plan = req.plan;

//         if(plan !== 'premium'){
//             return res.json({success:false,message:"This feature is only available for premium subscriptions"})
//         }
        
//         const{public_id}= await cloudinary.uploader.upload(image.path)
//         const imageUrl = cloudinary.url(public_id,{
//             transformation:[{effect:`gen_remove:${object}`}],
//             resource_type:'image'
//         })

//         await sql`INSERT INTO creations (user_id,prompt,content,type)
//                   VALUES(${userId},${`Removed ${object} from image`},${imageUrl},'image')`;

//         res.json({success:true, content: imageUrl})

//     } catch(error){
//         console.log(error.message)
//         res.json({success:false, message: error.message})
//     }
// }


// export const resumeReview = async (req, res) => {
//     try {
//         const { userId } = req.auth();
//         const resume = req.file;
//         const plan = req.plan;

//         if (plan !== 'premium') {
//             return res.json({ success: false, message: "This feature is only available for premium subscriptions" })
//         }

//         if (resume.size > 5 * 1024 * 1024) {
//             return res.json({ success: false, message: "Resume file size exceeds allowed size(5MB)." })
//         }

//         // Read PDF file
//         const dataBuffer = fs.readFileSync(resume.path);
        
//         // ✅ Load PDF document with proper config for serverless
//         const loadingTask = pdfjsLib.getDocument({
//             data: new Uint8Array(dataBuffer),
//             useSystemFonts: true,
//             useWorkerFetch: false,
//             isEvalSupported: false,
//         });
        
//         const pdfDocument = await loadingTask.promise;
//         const numPages = pdfDocument.numPages;
        
//         let pdfText = '';
        
//         // Extract text from each page
//         for (let pageNum = 1; pageNum <= numPages; pageNum++) {
//             const page = await pdfDocument.getPage(pageNum);
//             const textContent = await page.getTextContent();
//             const pageText = textContent.items.map(item => item.str).join(' ');
//             pdfText += pageText + '\n';
//         }

//         console.log("Extracted PDF Text Length:", pdfText.length);
//         console.log("First 300 chars:", pdfText.substring(0, 300));

//         // Check if text was extracted
//         if (!pdfText || pdfText.trim().length < 50) {
//             return res.json({ 
//                 success: false, 
//                 message: "Could not extract text from the PDF. Please ensure the resume is a text-based PDF, not a scanned image." 
//             });
//         }

//         const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement. Resume Content:\n\n${pdfText}`;

//         const response = await AI.chat.completions.create({
//             model: "gemini-3-flash-preview",
//             messages: [{
//                 role: "user",
//                 content: prompt,
//             }],
//             temperature: 0.7,
//             max_tokens: 1500,
//         });

//         const content = response.choices[0].message.content;

//         await sql`INSERT INTO creations (user_id, prompt, content, type)
//                   VALUES(${userId}, 'Review the uploaded resume', ${content}, 'resume-review')`;

//         res.json({ success: true, content })

//     } catch (error) {
//         console.log("Resume Review Error:", error.message, error.stack)
//         res.json({ success: false, message: error.message })
//     }
// }