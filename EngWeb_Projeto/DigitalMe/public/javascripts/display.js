function viewArchive(button) {
  const content = button.getAttribute('data-content');
  const mimetype = button.getAttribute('data-mimetype');
  const modal = document.getElementById('archiveModal');
  const archiveContent = document.getElementById('archiveContent');

  if (!content) {
    archiveContent.innerHTML = '<p>No content available for preview.</p>';
    modal.style.display = 'block';
    return;
  }

  let html = '';

  const imageTypes = ['png', 'jpeg', 'jpg', 'gif', 'webp', 'ico'];

  if (mimetype === 'pdf') {
    html = `<embed src="data:application/pdf;base64,${content}" type="application/pdf" width="100%" height="600px" />`;
  } else if (imageTypes.includes(mimetype.toLowerCase())) {
    html = `<img src="data:image/${mimetype};base64,${content}" alt="Image Preview" style="max-width:100%; max-height:600px;" />`;
  } else if (mimetype === 'txt' || mimetype === 'plain') {
    try {
      const decoded = atob(content);
      html = `<pre style="max-height:600px; overflow:auto; background:#f4f4f4; padding:1em; white-space:pre-wrap;">${decoded}</pre>`;
    } catch (err) {
      html = `<p>Failed to decode text file.</p>`;
    }
  } else if (mimetype === 'json') {
    try {
      const decoded = atob(content);
      const parsed = JSON.parse(decoded);
      const formatted = JSON.stringify(parsed, null, 2);
      html = `<pre style="max-height:600px; overflow:auto; background:#eef; padding:1em; white-space:pre-wrap;">${formatted}</pre>`;
    } catch (err) {
      html = `<p>Invalid JSON or failed to decode.</p>`;
    }
  } else {
    html = `<p>Preview not supported for type: ${mimetype}</p>`;
  }

  archiveContent.innerHTML = html;
  modal.style.display = 'block';
}

function closeModal() {
  document.getElementById('archiveModal').style.display = 'none';
  document.getElementById('archiveContent').innerHTML = '';
}

async function downloadArchive( button ) {
	const archiveId = button.getAttribute( 'data-id' );
	const link = document.createElement( 'a' );
	link.href = `/dashboard/download/${ archiveId }`;
	link.click();
}
