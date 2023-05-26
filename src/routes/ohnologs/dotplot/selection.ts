export type Cursor = "move" | "ns-resize" | "ew-resize" | "nwse-resize" | "nesw-resize";

export type Action =
  | "drag"
  | "resize_top"
  | "resize_bot"
  | "resize_left"
  | "resize_right"
  | "resize_top_left"
  | "resize_bot_left"
  | "resize_top_right"
  | "resize_bot_right";

export interface SelectionEvent {
  action: Action | null;
  x: number;
  y: number;
  width: number;
  height: number;
}
