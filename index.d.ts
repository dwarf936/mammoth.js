declare module "mammoth" {
    export interface StyleProperties {
        fontSize?: number;
        color?: string;
        bold?: boolean;
        italic?: boolean;
        underline?: boolean;
        strikethrough?: boolean;
        fontFamily?: string;
        highlight?: string;
        alignment?: string;
        spacingBefore?: number;
        spacingAfter?: number;
        lineSpacing?: number;
        leftIndent?: number;
        rightIndent?: number;
        firstLineIndent?: number;
        tableAlignment?: string;
        numId?: number;
    }

    export interface StyleInfo {
        styleId: string;
        name: string;
        type: "paragraph" | "character" | "table" | "numbering";
        properties?: StyleProperties;
    }

    export interface ConversionResult {
        value: string;
        messages: Message[];
    }

    export interface Message {
        type: "warning" | "error";
        message: string;
    }

    export interface Options {
        styleMap?: string[];
        includeDefaultStyleMap?: boolean;
        includeEmbeddedStyleMap?: boolean;
        convertImage?: ImageConverter;
        ignoreEmptyParagraphs?: boolean;
        idPrefix?: string;
    }

    export interface ImageConverter {
        (image: Image): Promise<ImageResult>;
    }

    export interface Image {
        read: string;
        contentType: string;
    }

    export interface ImageResult {
        src: string;
        alt?: string;
    }

    export function convertToHtml(input: Input, options?: Options): Promise<ConversionResult>;
    export function convertToMarkdown(input: Input, options?: Options): Promise<ConversionResult>;
    export function convert(input: Input, options?: Options): Promise<ConversionResult>;
    export function extractRawText(input: Input): Promise<string>;
    
    /**
     * Get style information by style name or style ID
     * @param input - The DOCX file as a buffer or path
     * @param styleName - The name or ID of the style to find
     * @returns Promise that resolves to style information or null if not found
     */
    export function getUserStyle(input: Input, styleName: string): Promise<StyleInfo | null>;
    
    export function embedStyleMap(input: Input, styleMap: string[]): Promise<Buffer>;
    export function readEmbeddedStyleMap(input: Input): Promise<string[]>;

    export type Input = string | Buffer | { path: string } | { buffer: Buffer };
}