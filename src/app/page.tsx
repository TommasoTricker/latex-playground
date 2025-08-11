"use client"

import LatexEditor from "@/components/LatexEditor"
import ToolbarItem from "@/components/ToolbarItem"
import Console, { ConsoleHandle } from "@/components/Console"
import { Allotment } from "allotment"
import "allotment/dist/style.css"
import { Terminal } from "lucide-react"
import Script from "next/script"
import { useCallback, useEffect, useRef, useState } from "react"

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

    const typeTimeout = useRef<NodeJS.Timeout>(null)

    const consoleRef = useRef<ConsoleHandle | null>(null)
    const codeRef = useRef<string>(defaultCode)

    useEffect(() => {
        codeRef.current = code
    }, [code])

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

    const compile = useCallback((src: string) => {
        const pdftex = new PDFTeX(`${basePath}/texlive.js/pdftex-worker.js`)
        pdftex.on_stdout = (msg: string) => {
            consoleRef.current?.printLn(msg)
            console.log(msg)
        }
        pdftex.on_stderr = (msg: string) => {
            consoleRef.current?.printLn(msg)
            console.error(msg)
        }

        pdftex.compile(src).then((uri: string | false) => {
            if (uri) setPdfUri(uri)
            else consoleRef.current?.printLn("Compilation failed.")
        })
    }, [])

    useEffect(() => {
        const savedCode = localStorage.getItem("tex-code")
        const savedAuto = localStorage.getItem("auto-compile")
        if (savedCode !== null) setCode(savedCode)
        if (savedAuto !== null) setAutoCompile(savedAuto === "true")
        setHydrated(true)
    }, [])

    useEffect(() => {
        if (!hydrated) return
        compile(codeRef.current)
    }, [hydrated, compile])

    useEffect(() => {
        if (!hydrated) return
        localStorage.setItem("tex-code", code)
    }, [code, hydrated])

    useEffect(() => {
        if (!hydrated) return
        localStorage.setItem("auto-compile", autoCompile.toString())
    }, [autoCompile, hydrated])

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
            <Script src={`${basePath}/texlive.js/promisejs/promise.js`} strategy="beforeInteractive" />
            <Script src={`${basePath}/texlive.js/pdftex.js`} strategy="beforeInteractive" />

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

                        <Console ref={consoleRef} />
                    </Allotment>

                    {pdfUri && <iframe src={pdfUri} className="h-full w-full" />}
                </Allotment>
            </div>
        </>
    )
}
