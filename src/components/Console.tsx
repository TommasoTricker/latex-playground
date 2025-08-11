"use client"

import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react"

export interface ConsoleHandle {
    print(str: string): void
    printLn(str: string): void
}

type ConsoleProps = React.ComponentPropsWithoutRef<'pre'>

const Console = forwardRef<ConsoleHandle, ConsoleProps>((_, ref) => {
    const [output, setOutput] = useState<string>("")
    const preRef = useRef<HTMLPreElement | null>(null)

    const append = useCallback((str: string) => {
        setOutput(prev => {
            const element = preRef.current
            let shouldScroll = false
            if (element) {
                const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 5
                shouldScroll = isAtBottom
            }
            const nextOutput = prev + str
            setTimeout(() => {
                if (shouldScroll && preRef.current) {
                    preRef.current.scrollTop = preRef.current.scrollHeight
                }
            }, 0)
            return nextOutput
        })
    }, [])

    useImperativeHandle(
        ref,
        () => ({
            print: (str: string) => append(str),
            printLn: (str: string) => append(str + "\n"),
        }),
        [append]
    )

    return (
        <pre ref={preRef} className="font-mono h-full p-3 overflow-auto text-sm">
            {output}
        </pre>
    )
})

Console.displayName = "Console"

export default Console
