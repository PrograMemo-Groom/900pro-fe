import { StateField, RangeSet } from '@codemirror/state';
import { Decoration, DecorationSet, EditorView, WidgetType } from '@codemirror/view';
import { filterByClientId, createMemoIconWidget } from '@/pages/my-test/components/CodeEditor/codemirror/highlightWidgets';
import { addHighlightEffect, clearHighlightsEffect, removeHighlightEffect, updateHighlightColorEffect } from '@/pages/my-test/components/CodeEditor/codemirror/highlightEffects';
import { hexToRgba, rgbaToHex } from '@/pages/my-test/components/CodeEditor/utils/colorUtils';
import { createIconDOM } from '@/pages/my-test/components/CodeEditor/utils/domUtils';

/**
 * 하이라이트 필드 - CodeMirror 상태에 하이라이트 정보를 저장
 */
export const highlightField = StateField.define<DecorationSet>({
  create() {
    return RangeSet.of([]);
  },
  update(highlights, tr) {
    highlights = highlights.map(tr.changes);

    for (const e of tr.effects) {
      if (e.is(clearHighlightsEffect)) {
        return RangeSet.of([]);
      }

      if (e.is(removeHighlightEffect)) {
        const clientIdToRemove = e.value;
        highlights = highlights.update({
          filter: (from, to, value) => filterByClientId(from, to, value, clientIdToRemove)
        });
      }

      if (e.is(addHighlightEffect)) {
        const { highlight, setActiveMemo, editorView, onHighlightClick } = e.value;
        const { from, to, color, clientId, isMemo } = highlight;

        const decorationsToAdd = [];

        const highlightDecoration = Decoration.mark({
          class: 'cm-highlight',
          attributes: {
            'data-client-id': clientId,
            title: isMemo ? '메모 및 하이라이트' : '하이라이트된 텍스트',
            style: `background-color: ${color} !important;`
          }
        }).range(from, to);
        decorationsToAdd.push(highlightDecoration);

        if (isMemo && editorView) {
          let iconColor = rgbaToHex(color);

          const iconDecoration = Decoration.widget({
            widget: createMemoIconWidget(clientId, iconColor, highlight, setActiveMemo, editorView, onHighlightClick),
            side: 0
          }).range(to);
          decorationsToAdd.push(iconDecoration);
        }

        highlights = highlights.update({
          add: decorationsToAdd,
        });
      }

      if (e.is(updateHighlightColorEffect)) {
        const { clientId, newColor, isMemo, from, to } = e.value;

        highlights = highlights.update({
          filter: (from, to, value) => filterByClientId(from, to, value, clientId)
        });

        const decorationsToAdd = [];
        const newRgbaColor = hexToRgba(newColor);

        const highlightDecoration = Decoration.mark({
          class: 'cm-highlight',
          attributes: {
            'data-client-id': clientId,
            title: isMemo ? '메모 및 하이라이트' : '하이라이트된 텍스트',
            style: `background-color: ${newRgbaColor} !important;`
          }
        }).range(from, to);
        decorationsToAdd.push(highlightDecoration);

        if (isMemo) {
          const iconColor = newColor;

          const iconDecoration = Decoration.widget({
            widget: new class extends WidgetType {
              readonly widgetClientId: string = clientId;

              toDOM() {
                return createIconDOM(this.widgetClientId, iconColor);
              }

              ignoreEvent() { return false; }
            },
            side: 0
          }).range(to);

          decorationsToAdd.push(iconDecoration);
        }

        highlights = highlights.update({
          add: decorationsToAdd,
        });
      }
    }

    return highlights;
  },
  provide: field => EditorView.decorations.from(field)
});
