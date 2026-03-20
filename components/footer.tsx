/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { MapPin, Phone } from "lucide-react";

import { SourceHtml } from "@/components/source-html";
import { campusContacts, footerColumns } from "@/lib/home-content";
import type { SiteChrome } from "@/lib/source-site";

type SiteFooterProps = {
  chrome: SiteChrome;
};

const HOME_LOGO = "https://etest.edu.vn/wp-content/uploads/2018/10/logo-ETEST-MAIN.png";

export function SiteFooter({ chrome }: SiteFooterProps) {
  return (
    <footer className="etest-site-footer">
      {/* Home footer */}
      <div className="bg-[#9c1619] text-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 py-16 sm:px-8 lg:py-20">
          <div className="text-center">
            <img src={HOME_LOGO} alt="ETEST" className="mx-auto h-20 w-auto" />
            <p className="mt-6 text-sm font-bold uppercase tracking-[0.24em] text-[#f3dc80]">
              CÔNG TY CỔ PHẦN ANH NGỮ ETEST
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {campusContacts.map((campus) => (
              <div
                key={campus.campus}
                className="rounded-[26px] border border-white/12 bg-white/8 px-6 py-6 backdrop-blur"
              >
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#f3dc80]">
                  {campus.campus}
                </p>
                <p className="mt-4 text-base leading-8 text-white/84">{campus.address}</p>
                <div className="mt-5 space-y-3 text-sm font-semibold">
                  <a
                    href={`tel:${campus.phone.replace(/\s+/g, "")}`}
                    className="flex items-center gap-2"
                  >
                    <Phone className="size-4 text-[#f3dc80]" />
                    {campus.phone}
                  </a>
                  <a
                    href={campus.href}
                    className="flex items-center gap-2 text-white/82"
                    rel={campus.href.startsWith("http") ? "noreferrer" : undefined}
                    target={campus.href.startsWith("http") ? "_blank" : undefined}
                  >
                    <MapPin className="size-4 text-[#f3dc80]" />
                    Xem bản đồ
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {footerColumns.map((column) => (
              <div key={column.title} className="space-y-4">
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#f3dc80]">
                  {column.title}
                </p>
                <div className="space-y-3 text-base leading-7 text-white/82">
                  {column.links.map((link) =>
                    link.external ? (
                      <a
                        key={`${column.title}-${link.href}`}
                        href={link.href}
                        rel="noreferrer"
                        target="_blank"
                        className="block transition hover:text-white"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        key={`${column.title}-${link.href}`}
                        href={link.href}
                        className="block transition hover:text-white"
                      >
                        {link.label}
                      </Link>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 border-t border-white/12 pt-6 text-sm text-white/70 sm:flex-row sm:items-center sm:justify-between">
            <p>Copyright © ETEST 2026. All rights reserved.</p>
            <p>Homepage rebuilt with Next.js and Tailwind CSS.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
