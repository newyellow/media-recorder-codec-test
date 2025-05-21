# MediaRecorder Codec Support Tester

A web-based tool to test browser support for various video codecs using the MediaRecorder API. This tool helps developers and users quickly identify which video codecs are supported in their current browser and test recording capabilities. Originally developed to assist in the development of SnapAR CameraKit applications, but might be handy for other purposes.

🔗 **Live Demo**: [https://newyellow.idv.tw/projects/codec-check](https://newyellow.idv.tw/projects/codec-check)

## Features

- 📹 Real-time camera preview
- 📋 List of common video codecs with support status
- ✅ Visual indicators for supported/unsupported codecs
- 🎥 Test recording capability for each supported codec
- 💾 Automatic download of test recordings
- 📱 Responsive design that works on all devices
- 🔍 Detailed browser and device information

## Supported Codecs

The tool tests support for various video codecs including:
- WebM (VP8, VP9, H.264)
- MP4 (H.264, AVC1)
- Ogg (Theora)

## How to Use

1. Open the website in your browser
2. Allow camera access when prompted
3. View the list of codecs and their support status
4. Click "Test Record" on any supported codec to:
   - Record a 2-second video sample
   - Automatically download the recorded file
   - File extension will match the codec type (.webm, .mp4, or .ogv)

## License

This project is open source and available under the MIT License.
