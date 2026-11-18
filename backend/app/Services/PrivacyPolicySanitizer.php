<?php

namespace App\Services;

use DOMDocument;
use DOMElement;
use DOMNode;
use DOMText;

class PrivacyPolicySanitizer
{
    public function sanitize(string $html): string
    {
        $document = new DOMDocument;
        $previous = libxml_use_internal_errors(true);
        try {
            $document->loadHTML('<?xml encoding="UTF-8"><body>'.$html.'</body>', LIBXML_NONET | LIBXML_NOERROR | LIBXML_NOWARNING);
            $body = $document->getElementsByTagName('body')->item(0);

            return $body ? $this->children($body) : '';
        } finally {
            libxml_clear_errors();
            libxml_use_internal_errors($previous);
        }
    }

    private function children(DOMNode $node): string
    {
        $output = '';
        foreach ($node->childNodes as $child) {
            $output .= $this->render($child);
        }

        return $output;
    }

    private function render(DOMNode $node): string
    {
        if ($node instanceof DOMText) {
            return htmlspecialchars($node->textContent, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        }
        if (! $node instanceof DOMElement) {
            return '';
        }
        $tag = strtolower($node->tagName);
        if (in_array($tag, ['script', 'style', 'iframe', 'object', 'embed', 'svg', 'math', 'template', 'form', 'input', 'textarea', 'button', 'noscript'], true)) {
            return '';
        }
        $content = $this->children($node);
        if (! in_array($tag, ['p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b', 'em', 'i', 'u', 's', 'blockquote', 'pre', 'code', 'ol', 'ul', 'li', 'a', 'span', 'sub', 'sup'], true)) {
            return $content;
        }
        $attributes = '';
        if ($tag === 'a') {
            $href = trim($node->getAttribute('href'));
            if (preg_match('~^(https?://|mailto:)[^\s\x00-\x20]+$~i', $href)) {
                $attributes = ' href="'.htmlspecialchars($href, ENT_QUOTES, 'UTF-8').'" rel="noopener noreferrer"';
            }
        }
        if ($tag === 'li' && in_array($node->getAttribute('data-list'), ['bullet', 'ordered'], true)) {
            $attributes .= ' data-list="'.$node->getAttribute('data-list').'"';
        }
        $classes = array_filter(explode(' ', $node->getAttribute('class')), fn (string $class): bool => (bool) preg_match('/^ql-(align-(center|right|justify)|indent-[1-8])$/', $class));
        if ($classes) {
            $attributes .= ' class="'.implode(' ', $classes).'"';
        }

        return '<'.$tag.$attributes.'>'.($tag === 'br' ? '' : $content.'</'.$tag.'>');
    }
}
