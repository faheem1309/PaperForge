import React from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
  block?: boolean;
}

/**
 * Parses a string containing LaTeX delimiters:
 * - Block math: $$ ... $$ or \[ ... \]
 * - Inline math: $ ... $ or \( ... \)
 * And renders them with KaTeX.
 */
export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '', block = false }) => {
  if (!content) return null;

  // Split by inline $...$ and block $$...$$
  const renderMathContent = () => {
    // Regular expression to match $$...$$ and $...$
    const parts: React.ReactNode[] = [];
    const regex = /(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    let keyIndex = 0;

    while ((match = regex.exec(content)) !== null) {
      // Text before formula
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${keyIndex++}`}>
            {content.substring(lastIndex, match.index)}
          </span>
        );
      }

      const rawFormula = match[0];
      const isBlock = rawFormula.startsWith('$$');
      const formula = isBlock 
        ? rawFormula.substring(2, rawFormula.length - 2).trim()
        : rawFormula.substring(1, rawFormula.length - 1).trim();

      try {
        const html = katex.renderToString(formula, {
          displayMode: isBlock || block,
          throwOnError: false,
          output: 'html',
        });
        parts.push(
          <span
            key={`math-${keyIndex++}`}
            className={isBlock ? "block my-2 text-center" : "inline-block mx-0.5"}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch {
        parts.push(<span key={`err-${keyIndex++}`} className="text-red-500 font-mono text-xs">{rawFormula}</span>);
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(
        <span key={`tail-${keyIndex++}`}>
          {content.substring(lastIndex)}
        </span>
      );
    }

    return parts;
  };

  return <span className={`math-content ${className}`}>{renderMathContent()}</span>;
};

export const COMMON_MATH_SYMBOLS = [
  { label: 'α', latex: '\\alpha ' },
  { label: 'β', latex: '\\beta ' },
  { label: 'θ', latex: '\\theta ' },
  { label: 'π', latex: '\\pi ' },
  { label: 'λ', latex: '\\lambda ' },
  { label: 'Δ', latex: '\\Delta ' },
  { label: '√x', latex: '\\sqrt{x} ' },
  { label: 'x²', latex: 'x^{2} ' },
  { label: 'a/b', latex: '\\frac{a}{b} ' },
  { label: '∫', latex: '\\int_{0}^{\\infty} ' },
  { label: '∑', latex: '\\sum_{i=1}^{n} ' },
  { label: '±', latex: '\\pm ' },
  { label: '≠', latex: '\\neq ' },
  { label: '≤', latex: '\\le ' },
  { label: '≥', latex: '\\ge ' },
  { label: '∞', latex: '\\infty ' },
  { label: '→', latex: '\\rightarrow ' },
  { label: 'd/dx', latex: '\\frac{d}{dx} ' },
];
