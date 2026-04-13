
const links = [
    "https://drive.google.com/file/d/1SddmD3Uv1x30I5QrEG2FVY5q1j5ekWPz/view?usp=drive_link",
    "https://drive.google.com/uc?export=view&id=1SddmD3Uv1x30I5QrEG2FVY5q1j5ekWPz",
    "https://drive.google.com/open?id=1SddmD3Uv1x30I5QrEG2FVY5q1j5ekWPz",
    "https://drive.google.com/thumbnail?id=1SddmD3Uv1x30I5QrEG2FVY5q1j5ekWPz&sz=w800"
];

const DRIVE_PATTERNS = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/
];

function extractId(url) {
    for (const pattern of DRIVE_PATTERNS) {
        const match = url.match(pattern);
        if (match && match[1]) return match[1];
    }
    return null;
}

links.forEach(link => {
    console.log(`Link: ${link} -> ID: ${extractId(link)}`);
});
