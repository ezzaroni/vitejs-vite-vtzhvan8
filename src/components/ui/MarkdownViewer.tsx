import React from 'react';
import { cn } from '@/lib/utils';

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content, className }) => {
  const formatMarkdown = (text: string) => {
    // Convert markdown to HTML-like elements
    let formatted = text;

    // Headers
    formatted = formatted.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    formatted = formatted.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    formatted = formatted.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold and italic
    formatted = formatted.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Code blocks
    formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Links
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Lists
    formatted = formatted.replace(/^\* (.*$)/gim, '<li>$1</li>');
    formatted = formatted.replace(/^- (.*$)/gim, '<li>$1</li>');

    // Line breaks
    formatted = formatted.replace(/\n/g, '<br>');

    return formatted;
  };

  const renderFormattedContent = () => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let listItems: string[] = [];
    let codeBlock = '';
    let inCodeBlock = false;
    let inTable = false;
    let tableRows: string[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc pl-6 mb-4 space-y-1">
            {listItems.map((item, idx) => (
              <li key={idx} className="text-gray-300" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item) }} />
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    const flushTable = () => {
      if (tableRows.length > 0) {
        const [header, separator, ...rows] = tableRows;
        elements.push(
          <div key={`table-${elements.length}`} className="overflow-x-auto mb-6">
            <table className="w-full border-collapse border border-gray-600 rounded-lg">
              <thead>
                <tr className="bg-gray-800">
                  {header.split('|').slice(1, -1).map((cell, idx) => (
                    <th key={idx} className="border border-gray-600 px-4 py-2 text-left text-gray-200 font-semibold">
                      {cell.trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-gray-800/50">
                    {row.split('|').slice(1, -1).map((cell, cellIdx) => (
                      <td key={cellIdx} className="border border-gray-600 px-4 py-2 text-gray-300">
                        <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(cell.trim()) }} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
        inTable = false;
      }
    };

    const formatInlineMarkdown = (text: string) => {
      let formatted = text;
      formatted = formatted.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
      formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-gray-700 px-2 py-1 rounded text-purple-300">$1</code>');
      formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-purple-400 hover:text-purple-300 underline">$1</a>');
      return formatted;
    };

    lines.forEach((line, index) => {
      // Handle code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${elements.length}`} className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-4 overflow-x-auto">
              <code className="text-green-400 text-sm">{codeBlock}</code>
            </pre>
          );
          codeBlock = '';
          inCodeBlock = false;
        } else {
          flushList();
          flushTable();
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlock += line + '\n';
        return;
      }

      // Handle tables
      if (line.includes('|') && line.trim() !== '') {
        if (!inTable) {
          flushList();
          inTable = true;
        }
        tableRows.push(line);
        return;
      } else if (inTable) {
        flushTable();
      }

      // Handle headers
      if (line.startsWith('# ')) {
        flushList();
        elements.push(
          <h1 key={`h1-${elements.length}`} className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
            {line.substring(2)}
          </h1>
        );
        return;
      }

      if (line.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={`h2-${elements.length}`} className="text-2xl font-bold text-white mb-4 mt-8 border-b border-gray-700 pb-2">
            {line.substring(3)}
          </h2>
        );
        return;
      }

      if (line.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={`h3-${elements.length}`} className="text-xl font-semibold text-white mb-3 mt-6">
            {line.substring(4)}
          </h3>
        );
        return;
      }

      if (line.startsWith('#### ')) {
        flushList();
        elements.push(
          <h4 key={`h4-${elements.length}`} className="text-lg font-semibold text-gray-200 mb-2 mt-4">
            {line.substring(5)}
          </h4>
        );
        return;
      }

      // Handle lists
      if (line.startsWith('- ') || line.startsWith('* ')) {
        listItems.push(line.substring(2));
        return;
      }

      // Handle numbered lists
      if (/^\d+\.\s/.test(line)) {
        if (listItems.length === 0) {
          // Start ordered list
        }
        listItems.push(line.replace(/^\d+\.\s/, ''));
        return;
      }

      // Handle special syntax
      if (line.startsWith('├── ') || line.startsWith('└── ') || line.startsWith('│ ')) {
        flushList();
        elements.push(
          <div key={`tree-${elements.length}`} className="font-mono text-gray-300 text-sm mb-1">
            {line}
          </div>
        );
        return;
      }

      // Handle empty lines
      if (line.trim() === '') {
        flushList();
        elements.push(<div key={`space-${elements.length}`} className="mb-2" />);
        return;
      }

      // Handle regular paragraphs
      if (line.trim() !== '') {
        flushList();
        elements.push(
          <p key={`p-${elements.length}`} className="text-gray-300 mb-4 leading-relaxed"
             dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }} />
        );
      }
    });

    // Flush any remaining content
    flushList();
    flushTable();

    return elements;
  };

  return (
    <div className={cn("prose prose-invert max-w-none", className)}>
      {renderFormattedContent()}
    </div>
  );
};