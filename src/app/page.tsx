"use client"

import LatexEditor from "@/components/LatexEditor"
import ToolbarItem from "@/components/ToolbarItem"
import { Allotment } from "allotment"
import "allotment/dist/style.css"
import { Terminal } from "lucide-react"
import Script from "next/script"
import { useEffect, useRef, useState } from "react"

type PdfTeXEngine = {
    loadEngine(): Promise<void>
    flushCache?(): void
    writeMemFSFile(path: string, content: string): void
    setEngineMainFile(file: string): void
    compileLaTeX(): Promise<{ pdf: Uint8Array; status: number; log: string }>
}

declare global {
    interface Window {
        PdfTeXEngine: {
            new(): PdfTeXEngine
        }
    }
}

export default function Home() {
    const defaultCode = `\\documentclass{article}

\\begin{document}
    Hello, TeX!
\\end{document}
`

    const [hydrated, setHydrated] = useState(false)

    const [code, setCode] = useState<string>(defaultCode)
    const [autoCompile, setAutoCompile] = useState(false)
    const [pdfUri, setPdfUri] = useState<string | null>(null)
    const [output, setOutput] = useState<string>("")

    const engineRef = useRef<PdfTeXEngine | null>(null)
    const typeTimeout = useRef<NodeJS.Timeout>(null)

    const outputRef = useRef<HTMLPreElement | null>(null)

    useEffect(() => {
        const savedCode = localStorage.getItem("tex-code")
        const savedAuto = localStorage.getItem("auto-compile")
        if (savedCode !== null) setCode(savedCode)
        if (savedAuto !== null) setAutoCompile(savedAuto === "true")
        setHydrated(true)
    }, [])

    useEffect(() => {
        if (!hydrated) return
        localStorage.setItem("tex-code", code)
    }, [code, hydrated])

    useEffect(() => {
        if (!hydrated) return
        localStorage.setItem("auto-compile", autoCompile.toString())
    }, [autoCompile, hydrated])

    function print(str: string) {
        setOutput(prev => {
            const element = outputRef.current
            let shouldScroll = false

            if (element) {
                const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 5
                shouldScroll = isAtBottom
            }

            const nextOutput = prev + str

            setTimeout(() => {
                if (shouldScroll && outputRef.current) {
                    outputRef.current.scrollTop = outputRef.current.scrollHeight
                }
            }, 0)

            return nextOutput
        })
    }

    function printLn(str: string) {
        print(str + "\n")
    }

    async function handleEngineLoad() {
        printLn("Loading compiler...")

        const engine = new window.PdfTeXEngine()
        await engine.loadEngine()
        engineRef.current = engine

        await compile(code)
    }

    async function compile(src: string) {
        if (!engineRef.current) return

        printLn("Compiling...")

        const engine = engineRef.current
        engine.flushCache?.()
        engine.writeMemFSFile("main.tex", src)
        engine.setEngineMainFile("main.tex")

        const { pdf, status, log } = await engine.compileLaTeX()
        if (status === 0) {
            const blob = new Blob([new Uint8Array(pdf.buffer as ArrayBuffer)], { type: "application/pdf" })
            setPdfUri(URL.createObjectURL(blob))
        }

        printLn("Compilation terminated with status code " + status)
        print(log)
    }

    function handleChange(value: string | undefined) {
        if (value === undefined) return
        setCode(value)

        if (autoCompile) {
            if (typeTimeout.current !== null) clearTimeout(typeTimeout.current)
            typeTimeout.current = setTimeout(() => {
                compile(value)
            }, 250)
        }
    }

    function toggleAutoCompile() {
        const next = !autoCompile
        setAutoCompile(next)
        if (next) compile(code)
    }

    return (
        <>
            {hydrated && (
                <Script
                    src="/PdfTeXEngine.js"
                    onLoad={handleEngineLoad}
                />
            )}

            <div className="flex flex-col h-screen">
                <div className="flex gap-2 mx-2">
                    <ToolbarItem onClick={() => compile(code)}>
                        <Terminal />
                        Compile
                    </ToolbarItem>

                    <ToolbarItem onClick={toggleAutoCompile}>
                        <input
                            type="checkbox"
                            checked={autoCompile}
                            readOnly
                            className="accent-neutral-700 pointer-events-none"
                        />
                        Auto
                    </ToolbarItem>
                </div>

                <Allotment>
                    <Allotment vertical={true} defaultSizes={[75, 25]}>
                        <LatexEditor value={code} onChange={handleChange} />

                        <pre ref={outputRef} className="font-mono h-full p-3 overflow-auto text-sm" >
                            {output}
                        </pre>
                    </Allotment>

                    {pdfUri && <iframe src={pdfUri} className="h-full w-full" />}
                </Allotment>
            </div>
        </>
    )
}
