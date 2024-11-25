export class ExportService {
  static downloadAsJson(data: any, filename: string) {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    this.downloadFile(blob, filename)
  }

  static downloadAsCsv(data: any, filename: string) {
    // Convert structured data to CSV format
    const rows = []
    
    // Add headers
    const headers = Object.keys(data)
    rows.push(headers.join(','))
    
    // If the data is an array of objects
    if (Array.isArray(data[headers[0]])) {
      const rowCount = data[headers[0]].length
      for (let i = 0; i < rowCount; i++) {
        const row = headers.map(header => {
          const value = data[header][i]
          return this.formatCsvValue(value)
        })
        rows.push(row.join(','))
      }
    } else {
      // If the data is a single object
      const row = headers.map(header => {
        const value = data[header]
        return this.formatCsvValue(value)
      })
      rows.push(row.join(','))
    }

    const csv = rows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    this.downloadFile(blob, filename)
  }

  private static formatCsvValue(value: any): string {
    if (typeof value === 'string') {
      // Escape quotes and wrap in quotes if contains special characters
      const escaped = value.replace(/"/g, '""')
      return /[",\n\r]/.test(value) ? `"${escaped}"` : escaped
    }
    return String(value)
  }

  private static downloadFile(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}
