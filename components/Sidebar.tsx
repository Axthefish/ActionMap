"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const NavItem = ({ href, label }: { href: string; label: string }) => (
    <Link
      href={href}
      className={`block rounded-md px-3 py-2 text-sm transition-colors duration-200 hover:text-primary ${
        pathname === href ? "text-primary" : "text-foreground/80"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <motion.aside
      className="fixed left-0 top-0 z-40 h-screen border-r border-white/10 bg-transparent"
      animate={{ width: collapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="glass-strong flex h-full flex-col px-4 py-4">
        <AnimatePresence mode="wait" initial={false}>
          {!collapsed ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-3 select-none text-lg font-semibold"
            >
              Action Map
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-3 select-none text-lg font-semibold"
            >
              AM
            </motion.div>
          )}
        </AnimatePresence>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          <NavItem href="/" label="Home" />
          <NavItem href="/history" label="History" />
          <NavItem href="/new" label="New Session" />
        </nav>

        <div className="mt-3 flex items-center justify-between gap-2">
          <Button
            size="icon"
            variant="ghost"
            aria-label="Toggle sidebar"
            onClick={() => setCollapsed((v) => !v)}
          >
            {collapsed ? ">" : "<"}
          </Button>
          {!collapsed && (
            <span className="text-xs text-foreground/50">v0.1</span>
          )}
        </div>
      </div>
    </motion.aside>
  );
}

export default Sidebar;

