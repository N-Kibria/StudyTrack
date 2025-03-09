const fs = require("fs");
const pdfParse = require("pdf-parse");
const path = require("path");
const { OpenAI } = require("openai");


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, 
});


const extractTextFromPDF = async (filePath) => {
    try {
        const pdfData = fs.readFileSync(filePath);
        const data = await pdfParse(pdfData);
        return data.text;
    } catch (error) {
        console.error("PDF Parsing Error Details:", error);
        throw new Error("Failed to parse PDF. Please ensure the file is a valid PDF.");
    }
};

const generateQuiz = async (text) => {
    const trimmedText = text.slice(0, 1000); 
    const prompt = `Generate 5 multiple-choice questions based on the following text:\n${trimmedText}`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a quiz generator assistant." },
                { role: "user", content: prompt },
            ],
            max_tokens: 300,
            temperature: 0.7,
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error generating quiz:", error.response?.data || error.message);
        throw new Error("Failed to generate quiz.");
    }
};


const handleFileUpload = async (req, res) => {
    if (!req.files || !req.files.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const file = req.files.file;

    
    const validExtensions = [".pdf", ".txt"];
    const fileExtension = path.extname(file.name).toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
        return res.status(400).json({ success: false, message: "Invalid file format. Only PDF and TXT files are supported." });
    }

    const filePath = path.join(__dirname, "../uploads/quiz", file.name);

    try {
   
        await file.mv(filePath);

        let extractedText;
        if (fileExtension === ".pdf") {
            extractedText = await extractTextFromPDF(filePath);
        } else if (fileExtension === ".txt") {
            extractedText = fs.readFileSync(filePath, "utf-8");
        }

       
        const quiz = await generateQuiz(extractedText);
        res.json({ success: true, quiz });
    } catch (error) {
        console.error("Error handling file upload:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { handleFileUpload };
