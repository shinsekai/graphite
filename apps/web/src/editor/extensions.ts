import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Placeholder from '@tiptap/extension-placeholder';
import { common, createLowlight } from 'lowlight';

const lowlight = createLowlight(common);

const extensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3],
    },
    codeBlock: false,
    horizontalRule: false,
    link: false,
  }),
  Underline,
  Link.configure({
    autolink: true,
    openOnClick: true,
    linkOnPaste: true,
  }),
  TaskList,
  TaskItem.configure({
    nested: true,
  }),
  CodeBlockLowlight.configure({
    lowlight,
    defaultLanguage: null,
  }),
  HorizontalRule,
  Placeholder.configure({
    placeholder: "Type '/' for commands...",
  }),
];

export const getExtensions = () => extensions;
