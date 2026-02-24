"use client";

import { useState, useCallback } from "react";
import { read, utils } from "xlsx";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function DatasetUploadPage() {
    const { user, isDeveloper } = useAuth();
    const router = useRouter();

    const [file, setFile] = useState<File | null>(null);
    const [data, setData] = useState<any[]>([]);
    const [status, setStatus] = useState<"idle" | "parsing" | "ready" | "uploading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");


    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const dropped = e.dataTransfer.files[0];
        if (dropped && (dropped.name.endsWith(".xlsx") || dropped.name.endsWith(".xls") || dropped.name.endsWith(".csv"))) {
            processFile(dropped);
        } else {
            setStatus("error");
            setMessage("Please drop a valid Excel or CSV file.");
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = async (file: File) => {
        setFile(file);
        setStatus("parsing");
        try {
            const buffer = await file.arrayBuffer();
            // Read Excel file
            const wb = read(buffer, { type: "array" });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];

            // Convert to JSON
            const parsedData = utils.sheet_to_json(ws);
            if (parsedData.length === 0) throw new Error("File is empty or invalid format.");

            setData(parsedData);
            setStatus("ready");
            setMessage(`Successfully parsed ${parsedData.length} rows.`);
        } catch (err: any) {
            setStatus("error");
            setMessage(`Error parsing file: ${err.message}`);
        }
    };

    const uploadData = async () => {
        if (data.length === 0) return;
        setStatus("uploading");

        try {
            const res = await fetch("/api/process-dataset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ datasetId: file?.name, records: data }),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error);

            setStatus("success");
            setMessage(`Success! Processed ${result.processed} records. Updated scores for ${result.updatedAreas} areas.`);
        } catch (err: any) {
            setStatus("error");
            setMessage(`Upload failed: ${err.message}`);
        }
    };

    if (!user || !isDeveloper) {
        return <div className="p-8 text-gray-500">Verifying authorization...</div>;
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <motion.h1
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold text-white mb-2"
                >
                    Dataset Management
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-400"
                >
                    Upload and process environmental and infrastructure data to update Visit Scores globally.
                </motion.p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`bg-[#111] rounded-2xl p-10 mb-8 border-2 border-dashed transition-all duration-300 ${status === "idle" ? "border-[#333] hover:border-blue-500 hover:bg-[#151515]" :
                    status === "error" ? "border-red-500/50 bg-red-500/5" :
                        status === "success" ? "border-green-500/50 bg-green-500/5" :
                            "border-blue-500/50 bg-blue-500/5"
                    }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
            >
                <div className="flex flex-col items-center justify-center text-center">
                    {status === "idle" && <Upload className="w-16 h-16 text-gray-500 mb-6" />}
                    {status === "parsing" && <RefreshCw className="w-16 h-16 text-indigo-500 mb-6 animate-spin" />}
                    {status === "ready" && <FileSpreadsheet className="w-16 h-16 text-indigo-400 mb-6" />}
                    {status === "uploading" && <RefreshCw className="w-16 h-16 text-purple-500 mb-6 animate-spin" />}
                    {status === "success" && <CheckCircle2 className="w-16 h-16 text-green-500 mb-6" />}
                    {status === "error" && <AlertCircle className="w-16 h-16 text-red-500 mb-6" />}

                    {status === "idle" ? (
                        <>
                            <h3 className="text-xl font-semibold text-white mb-2">Drag & drop your Excel file here</h3>
                            <p className="text-gray-400 mb-6">Supports .xlsx, .xls, and .csv files up to 50MB</p>
                            <label className="btn-glow px-6 py-3 rounded-xl bg-indigo-600 text-white cursor-pointer font-medium">
                                Browse Files
                                <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
                            </label>
                        </>
                    ) : (
                        <div className="max-w-md mx-auto">
                            <h3 className="text-lg font-semibold text-white mb-2">{file?.name}</h3>
                            <p className={`text-sm mb-6 ${status === "error" ? "text-red-400" : status === "success" ? "text-green-400" : "text-indigo-300"}`}>
                                {message}
                            </p>

                            {status === "ready" && (
                                <div className="flex gap-4 justify-center">
                                    <button onClick={() => setStatus("idle")} className="px-6 py-3 rounded-xl bg-gray-800 text-white font-medium hover:bg-gray-700 transition">
                                        Cancel
                                    </button>
                                    <button onClick={uploadData} className="btn-glow px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium">
                                        Process & Update Scores
                                    </button>
                                </div>
                            )}

                            {(status === "success" || status === "error") && (
                                <button onClick={() => setStatus("idle")} className="px-6 py-3 rounded-xl bg-gray-800 text-white font-medium hover:bg-gray-700 transition">
                                    Upload Another File
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Data Preview */}
            {data.length > 0 && status === "ready" && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden shadow-2xl"
                >
                    <div className="px-6 py-4 bg-[#1a1a1a] border-b border-[#333]">
                        <h3 className="font-semibold text-white">Data Preview (First 5 rows)</h3>
                    </div>
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-500 uppercase bg-[#0c0c0c] border-b border-[#222]">
                                <tr>
                                    {Object.keys(data[0]).map((key) => (
                                        <th key={key} className="px-6 py-4 font-mono">{key}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.slice(0, 5).map((row, i) => (
                                    <tr key={i} className="border-b border-[#222] hover:bg-[#151515] transition-colors">
                                        {Object.values(row).map((val: any, j) => (
                                            <td key={j} className="px-6 py-4 truncate max-w-[200px]">
                                                {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
