import type {Fragment, Node as ProseMirrorNode, Slice} from '@tiptap/pm/model'

const LIST_TYPES = new Set(['bulletList', 'orderedList', 'taskList'])

/**
 * Serializes a copied slice to plain text for the text/plain clipboard flavor.
 * ProseMirror's default flattens lists into bare lines, losing the markers that make
 * the copied text readable (and pasteable back as a list via the markdown paste).
 */
export function serializeSliceAsText(slice: Slice): string {
	return blocksText(slice.content).join('\n\n')
}

function blocksText(fragment: Fragment): string[] {
	const blocks: string[] = []
	fragment.forEach(node => {
		const lines = blockLines(node)
		if (lines.length > 0) {
			blocks.push(lines.join('\n'))
		}
	})
	return blocks
}

function blockLines(node: ProseMirrorNode): string[] {
	if (LIST_TYPES.has(node.type.name)) {
		return listLines(node)
	}
	if (node.isTextblock) {
		return [node.textContent]
	}
	if (node.isLeaf) {
		return []
	}

	const lines: string[] = []
	node.forEach(child => lines.push(...blockLines(child)))
	return lines
}

function listLines(list: ProseMirrorNode): string[] {
	const lines: string[] = []
	let number = 1
	list.forEach(item => {
		const marker = list.type.name === 'orderedList' ? `${number++}. ` : '- '
		const indent = ' '.repeat(marker.length)
		blockLines(item).forEach((line, index) => {
			lines.push(index === 0 ? marker + line : indent + line)
		})
	})
	return lines
}
