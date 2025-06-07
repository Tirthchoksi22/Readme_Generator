"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Float, Environment } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Github, Zap, Code, FileText, Sparkles, Terminal, Cpu, X } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// 3D Floating Elements Component
function FloatingElements() {
  return (
    <>
      <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
        <mesh position={[-4, 2, -2]}>
          <octahedronGeometry args={[0.5]} />
          <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.3} />
        </mesh>
      </Float>

      <Float speed={2} rotationIntensity={1.5} floatIntensity={1.5}>
        <mesh position={[4, -1, -3]}>
          <icosahedronGeometry args={[0.3]} />
          <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={0.4} />
        </mesh>
      </Float>

      <Float speed={1.8} rotationIntensity={0.8} floatIntensity={2.5}>
        <mesh position={[2, 3, -1]}>
          <tetrahedronGeometry args={[0.4]} />
          <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.3} />
        </mesh>
      </Float>

      <Float speed={1.2} rotationIntensity={2} floatIntensity={1.8}>
        <mesh position={[-2, -2, -4]}>
          <dodecahedronGeometry args={[0.35]} />
          <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.2} />
        </mesh>
      </Float>

      <Float speed={2.5} rotationIntensity={1.2} floatIntensity={2.2}>
        <mesh position={[0, 1, -5]}>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshStandardMaterial color="#ff0080" emissive="#ff0080" emissiveIntensity={0.3} />
        </mesh>
      </Float>
    </>
  )
}

// ASCII Art Component
function ASCIIHeader() {
  const asciiArt = `
██████╗ ███████╗ █████╗ ██████╗ ███╗   ███╗███████╗     ██████╗ ███████╗███╗   ██╗
██╔══██╗██╔════╝██╔══██╗██╔══██╗████╗ ████║██╔════╝    ██╔════╝ ██╔════╝████╗  ██║
██████╔╝█████╗  ███████║██║  ██║██╔████╔██║█████╗      ██║  ███╗█████╗  ██╔██╗ ██║
██╔══██╗██╔══╝  ██╔══██║██║  ██║██║╚██╔╝██║██╔══╝      ██║   ██║██╔══╝  ██║╚██╗██║
██║  ██║███████╗██║  ██║██████╔╝██║ ╚═╝ ██║███████╗    ╚██████╔╝███████╗██║ ╚████║
╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝ ╚═╝     ╚═╝╚══════╝     ╚═════╝ ╚══════╝╚═╝  ╚═══╝
  `

  return (
    <div className="relative">
      <pre className="text-xs sm:text-sm md:text-base lg:text-lg text-cyan-400   whitespace-pre">
        {asciiArt}
      </pre>
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 blur-xl -z-10" />
    </div>
  )
}

// File Drop Zone Component
function FileDropZone({ onFilesSelected }: { onFilesSelected: (files: File[]) => void }) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [error, setError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFiles = (files: File[]): File[] => {
    const validExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.json', '.md', '.txt', '.yml', '.yaml', '.toml', '.cfg', '.ini']
    const maxFileSize = 5 * 1024 * 1024 // 5MB

    return files.filter(file => {
      const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
      const isValidExtension = validExtensions.includes(extension)
      const isValidSize = file.size <= maxFileSize

      if (!isValidExtension) {
        setError(`File ${file.name} has an invalid extension. Allowed extensions: ${validExtensions.join(', ')}`)
        return false
      }
      if (!isValidSize) {
        setError(`File ${file.name} is too large. Maximum size is 5MB`)
        return false
      }
      return true
    })
  }

  const processDirectory = useCallback(async (entry: FileSystemDirectoryEntry, path: string = ''): Promise<File[]> => {
    const files: File[] = []
    const reader = entry.createReader()

    const readEntries = async (): Promise<void> => {
      const entries = await new Promise<FileSystemEntry[]>((resolve) => {
        reader.readEntries((entries) => resolve(entries))
      })

      for (const entry of entries) {
        const currentPath = path ? `${path}/${entry.name}` : entry.name
        if (entry.isFile) {
          const file = await new Promise<File>((resolve) => {
            (entry as FileSystemFileEntry).file(resolve)
          })
          // Create a new File object with the full path
          const fileWithPath = new File([file], currentPath, { type: file.type })
          files.push(fileWithPath)
        } else if (entry.isDirectory) {
          const subFiles = await processDirectory(entry as FileSystemDirectoryEntry, currentPath)
          files.push(...subFiles)
        }
      }
    }

    await readEntries()
    return files
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
    setError("")
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
      setError("")

      const items = e.dataTransfer.items
      const files: File[] = []

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.kind === 'file') {
          const entry = item.webkitGetAsEntry()
          if (entry) {
            if (entry.isFile) {
              const file = item.getAsFile()
              if (file) files.push(file)
            } else if (entry.isDirectory) {
              const dirFiles = await processDirectory(entry as FileSystemDirectoryEntry)
              files.push(...dirFiles)
            }
          }
        }
      }

      const validFiles = validateFiles(files)
      if (validFiles.length > 0) {
        setUploadedFiles(validFiles)
        onFilesSelected(validFiles)
      }
    },
    [onFilesSelected, processDirectory],
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError("")
      const files = Array.from(e.target.files || [])
      const validFiles = validateFiles(files)

      if (validFiles.length > 0) {
        setUploadedFiles(validFiles)
        onFilesSelected(validFiles)
      }
    },
    [onFilesSelected],
  )

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const removeFile = useCallback((index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    setUploadedFiles(newFiles)
    onFilesSelected(newFiles)
  }, [uploadedFiles, onFilesSelected])

  // Group files by directory
  const groupedFiles = uploadedFiles.reduce((acc, file) => {
    const path = file.webkitRelativePath || file.name
    const dir = path.split('/').slice(0, -1).join('/')
    if (!acc[dir]) acc[dir] = []
    acc[dir].push(file)
    return acc
  }, {} as Record<string, File[]>)

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
          isDragOver
            ? "border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-400/25"
            : "border-gray-600 hover:border-purple-400 hover:bg-purple-400/5"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <Upload className={`h-12 w-12 ${isDragOver ? "text-cyan-400" : "text-gray-400"}`} />
          </div>
          <div>
            <p className="text-lg font-semibold text-white mb-2">Drop your code files or folder here</p>
            <p className="text-gray-400 text-sm">Supports .js, .py, .json, .md, .yml and more</p>
            <p className="text-gray-400 text-sm mt-1">Maximum file size: 5MB</p>
          </div>
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={handleBrowseClick}
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black hover:cursor-pointer"
            >
              <Upload className="mr-2 h-4 w-4" />
              Browse Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              // @ts-expect-error - webkitdirectory and directory are valid HTML attributes
              webkitdirectory="true"
              directory="true"
              accept=".js,.jsx,.ts,.tsx,.py,.json,.md,.txt,.yml,.yaml,.toml,.cfg,.ini"
              className="hidden"
              onChange={handleFileInput}
            />
          </div>
        </div>

        {isDragOver && <div className="absolute inset-0 bg-cyan-400/5 rounded-lg animate-pulse" />}
      </div>

      {error && (
        <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">
          {error}
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-white flex items-center">
            <FileText className="mr-2 h-4 w-4 text-green-400" />
            Uploaded Files ({uploadedFiles.length})
          </h4>
          <div className="space-y-4">
            {Object.entries(groupedFiles).map(([dir, files]) => (
              <div key={dir} className="space-y-2">
                {dir && (
                  <h5 className="text-xs font-medium text-gray-400">
                    {dir || 'Root'}
                  </h5>
                )}
                <div className="flex flex-wrap gap-2">
                  {files.map((file, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="border-green-400 text-green-400 group relative pr-8"
                    >
                      {file.name}
                      <button
                        onClick={() => removeFile(uploadedFiles.indexOf(file))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-50 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AIReadmeGenerator() {
  const [githubUrl, setGithubUrl] = useState("")
  const [generatedReadme, setGeneratedReadme] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const [githubError, setGithubError] = useState("")

  const extractGithubInfo = (url: string) => {
    try {
      const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/)
      if (!match) throw new Error("Invalid GitHub URL format")
      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, '')
      }
    } catch (error) {
      throw new Error("Please enter a valid GitHub repository URL")
    }
  }

  const handleGithubFetch = async () => {
    if (!githubUrl) {
      setGithubError("Please enter a GitHub repository URL")
      return
    }

    setIsFetching(true)
    setGithubError("")

    try {
      const { owner, repo } = extractGithubInfo(githubUrl)
      
      // Fetch repository data
      const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`)
      if (!repoResponse.ok) throw new Error("Repository not found")
      const repoData = await repoResponse.json()

      // Fetch repository contents
      const contentsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents`)
      if (!contentsResponse.ok) throw new Error("Could not fetch repository contents")
      const contentsData = await contentsResponse.json()

      // Create a mock file object from repository data
      const mockFile = new File(
        [JSON.stringify({
          name: repo,
          description: repoData.description,
          language: repoData.language,
          stars: repoData.stargazers_count,
          forks: repoData.forks_count,
          topics: repoData.topics,
          contents: contentsData
        }, null, 2)],
        'repository.json',
        { type: 'application/json' }
      )

      setSelectedFiles([mockFile])
      setGithubError("")
    } catch (fetchError) {
      setGithubError(fetchError instanceof Error ? fetchError.message : "Failed to fetch repository data")
      setSelectedFiles([])
    } finally {
      setIsFetching(false)
    }
  }

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedReadme("");

    try {
      let response: Response;
      
      if (selectedFiles.length > 0) {
        // Generate from files
        const fileContents: Record<string, string> = {};
        
        // Read file contents
        for (const file of selectedFiles) {
          try {
            const content = await file.text();
            fileContents[file.name] = content;
            console.log(`Successfully read file: ${file.name}`);
          } catch (readError) {
            console.error(`Error reading file ${file.name}:`, readError);
            throw new Error(`Failed to read file ${file.name}`);
          }
        }

        console.log("Files to be sent:", Object.keys(fileContents));
        const requestBody = { files: fileContents };
        console.log("Request body:", JSON.stringify(requestBody, null, 2));

        response = await fetch(`${API_URL}/api/generate-from-files`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Server response error:", errorData);
          throw new Error(errorData.error || 'Failed to generate README');
        }
      } else if (githubUrl) {
        // Generate from GitHub
        const { owner, repo } = extractGithubInfo(githubUrl);
        console.log("Sending GitHub info to backend:", { owner, repo });
        response = await fetch(`${API_URL}/api/generate-from-github`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ owner, repo }),
        });
      } else {
        throw new Error('No files or GitHub URL provided');
      }

      const data = await response.json();
      if (!data.readme) {
        throw new Error('No README content received from server');
      }
      setGeneratedReadme(data.readme);
    } catch (error: unknown) {
      console.error('Error generating README:', error);
      // Show error to user
      setGeneratedReadme(`Error: ${error instanceof Error ? error.message : 'Failed to generate README'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* 3D Background */}
      <div className="fixed inset-0 -z-10">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={0.5} color="#00ffff" />
          <pointLight position={[-10, -10, -10]} intensity={0.3} color="#ff00ff" />
          <FloatingElements />
          <Environment preset="night" />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      {/* Grid Background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px] -z-20" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <ASCIIHeader />
          <div className="mt-6 space-y-2">
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI-Powered README Generator
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Transform your code into professional documentation with the power of artificial intelligence
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="upload" className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 bg-gray-900/50 border border-gray-700">
              <TabsTrigger
                value="upload"
                className="data-[state=active]:bg-cyan-400 data-[state=active]:text-black font-semibold text-gray-600"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Files
              </TabsTrigger>
              <TabsTrigger
                value="github"
                className="data-[state=active]:bg-purple-400 data-[state=active]:text-black font-semibold text-gray-600 "
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub URL
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-cyan-400">
                    <Code className="mr-2 h-5 w-5" />
                    Upload Your Code Files
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FileDropZone onFilesSelected={setSelectedFiles} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="github" className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-purple-400">
                    <Github className="mr-2 h-5 w-5" />
                    GitHub Repository
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <Input
                      placeholder="https://github.com/username/repository"
                      value={githubUrl}
                      onChange={(e) => {
                        setGithubUrl(e.target.value)
                        setGithubError("")
                      }}
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400"
                    />
                    <Button
                      variant="outline"
                      onClick={handleGithubFetch}
                      disabled={isFetching}
                      className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black whitespace-nowrap hover:cursor-pointer disabled:opacity-50"
                    >
                      {isFetching ? (
                        <>
                          <Cpu className="mr-2 h-4 w-4 animate-spin" />
                          Fetching...
                        </>
                      ) : (
                        <>
                          <Github className="mr-2 h-4 w-4" />
                          Fetch
                        </>
                      )}
                    </Button>
                  </div>
                  {githubError && (
                    <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">
                      {githubError}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Generate Button */}
            <div className="text-center">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || (selectedFiles.length === 0 && !githubUrl)}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg shadow-cyan-500/25 disabled:opacity-50 hover:cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Cpu className="mr-2 h-5 w-5 animate-spin" />
                    Generating README...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate README
                  </>
                )}
              </Button>
            </div>

            {/* Generated README */}
            {generatedReadme && (
              <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-400">
                    <Terminal className="mr-2 h-5 w-5" />
                    Generated README.md
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Textarea
                      value={generatedReadme}
                      onChange={(e) => setGeneratedReadme(e.target.value)}
                      className="min-h-[400px] bg-gray-800 border-gray-600 text-white font-mono text-sm"
                      placeholder="Your generated README will appear here..."
                    />
                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(generatedReadme);
                            // You could add a toast notification here
                          } catch (error) {
                            console.error('Failed to copy:', error);
                          }
                        }}
                        className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black hover:cursor-pointer"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Copy to Clipboard
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const blob = new Blob([generatedReadme], { type: 'text/markdown' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'README.md';
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                        className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black hover:cursor-pointer"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Download README.md
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </Tabs>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 text-gray-400 text-sm">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span>Powered by AI • Built with React & Three.js</span>
            <Zap className="h-4 w-4 text-yellow-400" />
          </div>
        </div>
      </div>
    </div>
  )
}
