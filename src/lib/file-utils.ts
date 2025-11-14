export interface FileWithPreview extends File {
  preview?: string
}

export const createFilePreview = (file: File): Promise<FileWithPreview> => {
  return new Promise((resolve) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const fileWithPreview = Object.assign(file, { preview: reader.result as string })
        resolve(fileWithPreview)
      }
      reader.readAsDataURL(file)
    } else {
      resolve(file)
    }
  })
}

export const processFileList = async (
  fileList: FileList | null,
  maxFiles: number,
  currentFileCount: number
): Promise<FileWithPreview[]> => {
  if (!fileList || fileList.length === 0) {
    return []
  }
  
  const newFiles = Array.from(fileList).slice(0, maxFiles - currentFileCount)
  return Promise.all(newFiles.map(createFilePreview))
}
