/**
 * @author Adam (charrondev) Charron <adam.c@vanillaforums.com>
 * @copyright 2009-2018 Vanilla Forums Inc.
 * @license GPL-2.0-only
 */

import BaseSyntaxModule from "quill/modules/syntax";
import Quill from "quill/core";
import CodeBlockBlot from "@rich-editor/quill/blots/blocks/CodeBlockBlot";

/**
 * Override the core syntax module to register our own code block.
 */
export default class SyntaxModule extends BaseSyntaxModule {
    public static register() {
        super.register();
        Quill.register(CodeBlockBlot);
    }

    /**
     * Overridden in order to return focus to the element that was focused before we force selected quill.
     */
    public highlight() {
        const selectedElement = document.activeElement;
        super.highlight();
        if (selectedElement instanceof HTMLElement) {
            selectedElement.focus();
        }
    }
}