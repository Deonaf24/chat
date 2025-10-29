'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@/components/ui/shadcn-io/dropzone"
import { useState } from "react";
import { llm } from "@/app/lib/llm/llm"
import { rag } from "@/app/lib/rag/rag"
import { LogInPopUp } from "@/components/ui/custom/login";
import Navbar from "@/components/section/navbar/default";

export default function Chat() {

  const [files, setFiles] = useState<File[] | undefined>();
  const [level, setLevel] = useState<number>(1);
  const [subject, setSubject] = useState<string>("math");
  const [q_number, setQ_number] = useState<string>("1");
  const [prompt, setPrompt] = useState("");

  const handleDrop = async (acceptedfiles: File[]) => {
    if (acceptedfiles.length > 1){
      await rag.uploadMany(acceptedfiles);
    }
    else{
      await rag.uploadOne(acceptedfiles[0]);
    }
    setFiles(files);
  };

  const handlePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("User message:", prompt);
    const message = prompt;
    setPrompt("");
    const response = await llm.generate(level, subject, q_number, message)
    console.log("Icarus:", response);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Navbar />
      {/* Main */}
      <main className="container mx-auto grid gap-6 px-4 py-6 md:grid-cols-2">
        {/* Left: Dropzones */}
        <section className="space-y-4">
          {/* Dropzone 1: Assignment upload */}
          <Dropzone
            maxSize={1024 * 1024 * 30}
            minSize={1024}
            onDrop={handleDrop}
            onError={console.error}
            src={files}
          >
            <DropzoneEmptyState />
            <DropzoneContent />
          </Dropzone>
          {/* Dropzone 2: Answer sheet */}
          <Dropzone
            maxSize={1024 * 1024 * 30}
            minSize={1024}
            onDrop={handleDrop}
            onError={console.error}
            src={files}
          >
            <DropzoneEmptyState />
            <DropzoneContent />
          </Dropzone>
        </section>

        {/* Right: Chat */}
        <section className="flex flex-col rounded-xl border">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ minHeight: 300 }}>
            {/* message bubbles will go here */}
            <div className="text-sm text-muted-foreground">No messages yet.</div>
          </div>
          <Separator />
          {/* Input row */}
          <form className="p-3 flex gap-2" onSubmit={handlePrompt}>
            <input
              className="flex-1 border rounded-md px-3 py-2 text-sm outline-none"
              placeholder="Ask something…"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Button type="submit">Send</Button>
          </form>
        </section>
      </main>
    </div>
  );
}
