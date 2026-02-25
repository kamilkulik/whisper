"use client";

import { useTranslations } from "next-intl";
import { useCurrentLocale } from "../_hooks/useCurrentLocale";

export default function WhyIBuiltSection() {
    const t = useTranslations("LandingPage");
    const currentLocale = useCurrentLocale();

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
                        <div className="w-68 h-68 md:w-76 md:h-76 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
                            {currentLocale ? (
                                <img
                                    src={`/founder_1080.jpg`}
                                    srcSet={getImageSrcset("founder")}
                                    sizes="(max-width: 768px) 144px, 176px"
                                    alt="Founder of Evening Whisper"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-white/10 animate-pulse" />
                            )}
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl lg:text-4xl font-bold text-white text-center mb-8">
                        {t("why-i-built.title")}
                    </h2>

                    {/* Paragraphs */}
                    <p className="text-lg lg:text-xl text-blue-200/80 text-center leading-relaxed mb-6">
                        {t("why-i-built.paragraph-1")}
                    </p>
                    <p className="text-lg lg:text-xl text-blue-200/80 text-center leading-relaxed">
                        {t("why-i-built.paragraph-2")}
                    </p>
                </div>
            </div>
        </div>
    );
}
