export default function WidgetInstallPage() {
  return (
    <section>
      <h1>Widget Install</h1>
      <pre
        className="card"
        style={{ overflowX: 'auto' }}
      >{`<script src="https://cdn.smartrealtoragent.com/widget.js" data-bot-id="YOUR_BOT_ID"></script>`}</pre>
    </section>
  );
}
