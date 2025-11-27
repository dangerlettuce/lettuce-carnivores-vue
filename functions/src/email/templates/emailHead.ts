export function generateEmailHead(title: string, preview: string) {
  return `
    <mj-head>
      <mj-title>${title}</mj-title>
      <mj-preview>${preview}</mj-preview>
      <mj-style inline="inline">
        a { color: #1a73e8; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </mj-style>
      <mj-attributes>
        <mj-all font-family="Arial, sans-serif" />
        <mj-text font-size="16px" color="#333333" />
      </mj-attributes>
      <mj-raw>
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </mj-raw>
    </mj-head>
  `;
}