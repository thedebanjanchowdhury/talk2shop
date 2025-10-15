import React from 'react';
// Using inline SVGs to replace FaGithub and FaEnvelope for compilation stability(mobile responsiveness).

// Inline SVG for GitHub icon
const GitHubIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512">
        <path fill="currentColor" d="M165.9 397.4c0 10.2-19.9 14-36 14C93 411.4 64 382.4 64 345.4c0-37 29-66 65.9-66 16.1 0 36 3.8 36 14V397.4zM397.4 165.9c0-10.2 19.9-14 36-14C459 151.4 488 180.4 488 217.4c0 37-29 66-65.9 66-16.1 0-36-3.8-36-14V165.9zM248 8C111 8 0 119 0 256c0 144.3 92.5 249.2 221.7 281.4 16.1 3.5 22.1-7.4 22.1-15.6 0-7.7-.3-27.4-.4-53.2-90.1 16.4-109.1-39.2-109.1-39.2-14.7-37.4-36-47.4-36-47.4-29.4-20.4 2.1-20 2.1-20 32.5 2.3 49.6 33.3 49.6 33.3 28.9 49.4 75.8 35.1 94.7 26.6 2.9-20.7 11.4-35.1 20.8-43.1-71.4-8.1-146.5-35.7-146.5-159.2 0-35.1 12.5-64.2 33-87-3.3-8.1-14.3-41.2 3-85.8 0 0 26.9-8.7 88.3 33.3 25.4-7 52.6-10.4 79.7-10.4s54.3 3.4 79.7 10.4c61.4-42 88.3-33.3 88.3-33.3 17.5 44.6 6.5 77.7 3 85.8 20.5 22.8 33 51.9 33 87 0 123.7-75.3 151-146.8 159.2 11.6 10 22 30.1 22 60.5 0 43.8-.4 79.4-.4 90.3 0 8.4 5.9 19.5 22.3 15.6C425.5 505.2 512 400.3 512 256 512 119 401 8 264 8h-16z" />
    </svg>
);

// Inline SVG for Envelope icon
const EnvelopeIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path fill="currentColor" d="M502.3 190.8c3.2-8.6.5-18.4-6.4-24.9l-264-180.8C232.1 10.4 220 8 207.7 8s-24.4 2.4-31.4 8.7L6.4 165.9c-6.9 6.5-9.6 16.3-6.4 24.9.3 1 12.5 44.7 18.2 65.5 12.1 43.1 49.6 166.4 133.5 240.2 73.1 64.9 133.5 64.9 206.6 0 83.9-73.8 121.4-197.1 133.5-240.2 5.6-20.8 17.9-64.5 18.2-65.5zM256 470.8c-71.1 0-136.6-62.8-192-167.6C121.7 141 184.9 96 256 96c71.1 0 134.3 45 192 207.2-55.4 104.8-120.9 167.6-192 167.6zM320 256c0-35.3-28.7-64-64-64s-64 28.7-64 64 28.7 64 64 64 64-28.7 64-64z" />
    </svg>
);


export default function Footer() {
    const githubUrl = "https://github.com/talk2shop/app";
    const emailAddress = "talkshop96@gmail.com";
    
    return (
        <footer className="bg-slate-400 text-stone-700 py-10 border-t border-stone-200 mt-auto">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Responsive Grid: Stacks on mobile (col-1) and goes to 3 columns on tablet/desktop (md:col-3) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                    
                    {/* Column 1: Brand & Copyright */}
                    <div>
                        <h3 className="text-2xl font-bold text-stone-900 mb-2">Talk2Shope</h3>
                        <p className="text-sm">
                            Shop Smarter, Build Faster, Talk to Your Tech.
                        </p>
                        <p className="text-xs mt-4">
                            &copy; {new Date().getFullYear()} Talk2Shope. All rights reserved.
                        </p>
                    </div>

                    {/* Column 2: Contact Us */}
                    <div className="md:col-span-1">
                        <h4 className="text-lg font-semibold text-stone-900 mb-3">Contact Us</h4>
                        {/* Mobile centering (justify-center) and desktop alignment (md:justify-start) */}
                        <div className="flex items-center justify-center md:justify-start space-x-2">
                            <EnvelopeIcon className="w-5 h-5 text-purple-600" />
                            <a 
                                href={`mailto:${emailAddress}`}
                                className="text-stone-700 hover:text-purple-600 transition"
                            >
                                {emailAddress}
                            </a>
                        </div>
                    </div>

                    {/* Column 3: Social & Resources */}
                    <div className="md:col-span-1">
                        <h4 className="text-lg font-semibold text-stone-900 mb-3">Connect</h4>
                        {/* Mobile centering (justify-center) and desktop alignment (md:justify-start) */}
                        <div className="flex justify-center md:justify-start">
                            <a 
                                href={githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-2 text-stone-700 hover:text-purple-600 transition"
                            >
                                <GitHubIcon className="w-6 h-6" />
                                <span className='font-medium'>GitHub Repository</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
