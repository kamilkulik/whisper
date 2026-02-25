"use client";

import { useTranslations } from "next-intl";

export default function WhyIBuiltSection() {
    const t = useTranslations("LandingPage");

    const getImageSrcset = (baseName: string): string => {
        const sizes = [480, 640, 1080];
        return sizes
            .map((size) => `/${baseName}_${size}.jpg ${size}w`)
            .join(", ");
    };

    return (
        <div className="relative mb-16">
            <div className="max-w-3xl mx-auto px-6">
                <div className="bg-purple-950/40 backdrop-blur-sm rounded-2xl border border-purple-500/20 shadow-[0_0_60px_rgba(147,51,234,0.5)] py-16 px-8 md:px-12">
                    {/* Founder Photo */}
                    <div className="flex justify-center mb-10">
                        <div className="w-72 h-72 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
                            <img
                                src={`/founder_1080.jpg`}
                                srcSet={getImageSrcset("founder")}
                                sizes="(max-width: 768px) 288px, 384px"
                                alt="Founder of Evening Whisper"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl lg:text-4xl font-bold text-white text-center mb-8">
                        {t("why-i-built.title")}
                    </h2>

                    {/* Paragraphs */}
                    <p className="text-2xl lg:text-xl text-blue-200 text-justify leading-relaxed">
                        {t("why-i-built.paragraph-1")}
                    </p>
                    <br />
                    <p className="text-2xl lg:text-xl text-blue-200 text-justify leading-relaxed">
                        {t("why-i-built.paragraph-2")}
                    </p>
                </div>
            </div>
        </div>
    );
}
