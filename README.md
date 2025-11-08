## Sigmaboy – Chess Puzzle Player (Next.js)

Sigmaboy là ứng dụng chơi và luyện tập các bài toán chiếu hết (mate-in-N) với giao diện hiện đại, tối ưu cho web tĩnh. Dự án sử dụng Next.js 14, TailwindCSS, và `react-chessboard`. Mặc định giao diện tối (dark mode) và có nút đổi theme ở phần Play.

### Tính năng chính
- Trang Intro: nền cosmos, chessboard 3D và ghi chú "for @tocosac" cố định đáy.
- Trang Play: chơi puzzle với `react-chessboard`, highlight nước đi, theme tối mặc định.
- Xuất tĩnh sang thư mục `out/` để deploy dễ dàng (Netlify, GitHub Pages, v.v.).

### Cấu trúc chính
- `src/app`: cấu trúc routes Next.js (`/intro`, `/play`, layout, globals.css).
- `src/components`: các component UI (chess-board, chess-trainer, global-chrome, theme-toggle...).
- `src/lib/problems-adapter.ts`: ánh xạ dữ liệu từ `problems.json` thành cấu trúc Puzzle dùng trong app.
- `problems.json`: dữ liệu puzzle gốc (giữ lại, được app đọc trực tiếp).

### Yêu cầu
- Node.js 18+.
- NPM hoặc Yarn.

### Cài đặt và chạy (dev)
Sao chép lệnh bên dưới:

```
npm install
npm run dev -- --port 3001
```

Mở `http://localhost:3001/intro` hoặc `http://localhost:3001/play`.

### Build & Export tĩnh
Xuất site tĩnh vào thư mục `out/`:

```
npm run build
```

Do `next.config.js` đang `output: 'export'`, lệnh build sẽ tạo nội dung tĩnh trong `out/`. Không cần chạy `next export`.

### Triển khai tĩnh (Netlify / GH Pages)
- Netlify: file `netlify.toml` đã cấu hình `publish = "out"`. Bạn có thể drag-and-drop hoặc dùng build hook.
- GitHub Pages: deploy nội dung `out/` lên branch gh-pages.

### Ghi chú & dọn dẹp
- Repo đã được dọn các file di sản không còn dùng (webpack, jQuery, chessboard.js cũ, v.v.).
- Danh sách đã xóa: `index.html`, `index.js`, `display.js`, thư mục `chessboard/`, `webpack.config.js`, `random.js`, `toggle-scrollbar.js`, `polgar.py`, `polgar.pgn`, các file `.zip` drop cũ.
- Đã cập nhật `.gitignore` để bỏ qua `out/` và `*.zip`.

### Bản quyền dữ liệu puzzle
`problems.json` được giữ nguyên để ứng dụng hoạt động, và được ánh xạ bởi `src/lib/problems-adapter.ts`.

---
Made with Next.js, TailwindCSS, and react-chessboard.
