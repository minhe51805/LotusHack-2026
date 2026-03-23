"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
	Bell,
	BellOff,
	BotMessageSquare,
	GlobeIcon,
	LayoutDashboard,
	MessageSquare,
	PanelLeft,
	RefreshCw,
	Settings,
	X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

interface SessionSummary {
	id: string;
	createdAt: string;
	updatedAt: string;
	messages: { role: string }[];
	lead?: { full_name?: string; target_exam?: string } | null;
	needsSupport?: boolean;
}

interface ToastItem {
	id: number;
	message: string;
	type: "session" | "lead" | "support";
}

interface NavigationLink {
	href: string;
	label: string;
	icon: LucideIcon;
}

interface AdminSidebarProps {
	loading: boolean;
	pathname: string;
	sessions: SessionSummary[];
	liveSessions: Set<string>;
	notificationsOn: boolean;
	onRefresh: () => void;
	onToggleNotifications: () => void;
	onNavigate?: () => void;
}

const navigationLinks: NavigationLink[] = [
	{ href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
	{ href: "/admin/schools", label: "Trường học", icon: GlobeIcon },
	{ href: "/admin/settings", label: "Cài đặt", icon: Settings },
];

function formatTime(iso: string) {
	const date = new Date(iso);
	const now = new Date();
	const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);

	if (diffMin < 1) return "Vừa xong";
	if (diffMin < 60) return `${diffMin} phút trước`;

	const diffHours = Math.floor(diffMin / 60);
	if (diffHours < 24) return `${diffHours} giờ trước`;

	return date.toLocaleDateString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
	});
}

function isNavigationActive(pathname: string, href: string) {
	if (href === "/admin") {
		return pathname === href;
	}

	return pathname === href || pathname.startsWith(`${href}/`);
}

function getCurrentSectionLabel(pathname: string) {
	if (pathname === "/admin") {
		return "Tổng quan";
	}

	const navigationItem = navigationLinks.find((item) =>
		item.href === "/admin"
			? false
			: pathname === item.href || pathname.startsWith(`${item.href}/`),
	);

	if (navigationItem) {
		return navigationItem.label;
	}

	if (pathname.startsWith("/admin/")) {
		return "Chi tiết phiên";
	}

	return "Admin";
}

function getSessionLabel(session: SessionSummary) {
	return session.lead?.full_name?.trim() || `${session.id.slice(0, 12)}…`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToSummary(row: any): SessionSummary {
	return {
		id: row.id,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
		messages: row.messages ?? [],
		lead: row.lead ?? null,
		needsSupport: row.needs_support ?? false,
	};
}

let toastCounter = 0;

function AdminSidebar({
	loading,
	pathname,
	sessions,
	liveSessions,
	notificationsOn,
	onRefresh,
	onToggleNotifications,
	onNavigate,
}: AdminSidebarProps) {
	return (
		<div className="saas-panel flex h-full min-h-0 flex-col overflow-hidden">
			<div className="relative overflow-hidden px-5 pb-5 pt-6">
				<div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-primary/15 via-primary/5 to-transparent" />

				<div className="relative flex flex-col gap-4">
					<div className="flex items-start justify-between gap-3">
						<Link
							href="/admin"
							onClick={onNavigate}
							className="flex min-w-0 items-center gap-3"
						>
							<div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border bg-background shadow-sm">
								<BotMessageSquare className="size-5" />
							</div>
							<div className="flex min-w-0 flex-col gap-0.5">
								<span className="truncate text-sm font-semibold">
									Study Abroad AI
								</span>
								<span className="truncate text-xs text-muted-foreground">
									Admin workspace
								</span>
							</div>
						</Link>

						<div className="flex items-center gap-1.5">
							<Button
								type="button"
								variant={notificationsOn ? "secondary" : "outline"}
								size="icon-sm"
								onClick={onToggleNotifications}
								title={notificationsOn ? "Tắt thông báo" : "Bật thông báo"}
							>
								{notificationsOn ? <Bell /> : <BellOff />}
								<span className="sr-only">
									{notificationsOn ? "Tắt thông báo" : "Bật thông báo"}
								</span>
							</Button>
							<Button
								type="button"
								variant="outline"
								size="icon-sm"
								onClick={onRefresh}
								title="Làm mới dữ liệu"
							>
								<RefreshCw />
								<span className="sr-only">Làm mới dữ liệu</span>
							</Button>
						</div>
					</div>
				</div>
			</div>

			<div className="px-5">
				<Separator />
			</div>

			<div className="flex min-h-0 flex-1 flex-col px-3 pb-3 pt-4">
				<div className="flex items-center justify-between px-2">
					<div className="flex flex-col gap-1">
						<p className="text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
							Phiên chat
						</p>
						<p className="text-xs text-muted-foreground">
							Danh sách mới nhất, ưu tiên những phiên cần follow-up.
						</p>
					</div>
					<Badge variant="secondary">{sessions.length}</Badge>
				</div>

				<div className="min-h-0 flex-1 overflow-y-auto px-2 pb-6 pt-4">
					{loading ? (
						<div className="flex flex-col gap-2.5">
							{Array.from({ length: 5 }).map((_, index) => (
								<div
									key={index}
									className="rounded-[1.25rem] border bg-background/70 p-3"
								>
									<Skeleton className="h-4 w-2/3" />
									<Skeleton className="mt-3 h-3 w-1/2" />
									<div className="mt-4 flex gap-2">
										<Skeleton className="h-5 w-16 rounded-full" />
										<Skeleton className="h-5 w-20 rounded-full" />
									</div>
								</div>
							))}
						</div>
					) : sessions.length === 0 ? (
						<Empty className="min-h-56 border-border/80 bg-muted/30">
							<EmptyHeader>
								<EmptyMedia variant="icon">
									<MessageSquare />
								</EmptyMedia>
								<EmptyTitle>Chưa có phiên nào</EmptyTitle>
								<EmptyDescription>
									Khi có học viên bắt đầu trò chuyện, phiên mới sẽ xuất hiện ở
									đây.
								</EmptyDescription>
							</EmptyHeader>
						</Empty>
					) : (
						<div className="flex flex-col gap-2.5">
							{sessions.map((session) => {
								const isActive = pathname === `/admin/${session.id}`;
								const isLive = liveSessions.has(session.id);
								const messageCount = session.messages?.length ?? 0;
								const exam = session.lead?.target_exam?.trim();

								return (
									<Link
										key={session.id}
										href={`/admin/${session.id}`}
										onClick={onNavigate}
										className={cn(
											"group saas-card flex flex-col gap-3 p-3 transition-all hover:bg-muted/40",
											isActive &&
												"bg-background shadow-sm ring-1 ring-foreground/10",
											session.needsSupport &&
												!isActive &&
												"border-destructive/25 bg-destructive/5",
										)}
									>
										<div className="flex items-start justify-between gap-3">
											<div className="min-w-0 flex flex-col gap-1">
												<div className="flex items-center gap-2">
													{isLive ? (
														<span className="relative flex size-2.5 shrink-0">
															<span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/70" />
															<span className="relative inline-flex size-2.5 rounded-full bg-primary" />
														</span>
													) : (
														<span className="size-2.5 shrink-0 rounded-full bg-muted" />
													)}
													<p className="truncate text-sm font-medium">
														{getSessionLabel(session)}
													</p>
												</div>
												<p className="truncate text-xs text-muted-foreground">
													{session.id}
												</p>
											</div>
											<span className="shrink-0 text-[11px] text-muted-foreground">
												{formatTime(session.updatedAt)}
											</span>
										</div>

										<div className="flex flex-wrap gap-2">
											<Badge variant={isActive ? "default" : "outline"}>
												{messageCount} tin nhắn
											</Badge>
											{exam ? <Badge variant="secondary">{exam}</Badge> : null}
											{session.lead?.full_name ? (
												<Badge variant="outline">Đã có lead</Badge>
											) : null}
											{session.needsSupport ? (
												<Badge variant="destructive">Cần hỗ trợ</Badge>
											) : null}
										</div>
									</Link>
								);
							})}
						</div>
					)}
				</div>

				<div className="px-2 pb-3">
					<Separator />
				</div>

				<div className="flex flex-col gap-3 px-2">
					<div className="flex flex-col gap-1">
						<p className="text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
							Điều hướng
						</p>
						<p className="text-xs text-muted-foreground">
							Nội dung, dữ liệu và cấu hình của hệ thống tư vấn.
						</p>
					</div>

					<div className="flex flex-col gap-1.5">
						{navigationLinks.map(({ href, icon: Icon, label }) => {
							const active = isNavigationActive(pathname, href);

							return (
								<Button
									key={href}
									asChild
									variant={active ? "default" : "ghost"}
									className="w-full justify-start"
								>
									<Link href={href} onClick={onNavigate}>
										<Icon data-icon="inline-start" />
										{label}
									</Link>
								</Button>
							);
						})}
					</div>

					<Button asChild variant="outline" className="w-full justify-start">
						<Link href="/" target="_blank" onClick={onNavigate}>
							<MessageSquare data-icon="inline-start" />
							Mở landing page
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const [sessions, setSessions] = useState<SessionSummary[]>([]);
	const [loading, setLoading] = useState(true);
	const [liveSessions, setLiveSessions] = useState<Set<string>>(new Set());
	const [notificationsOn, setNotificationsOn] = useState(false);
	const [toasts, setToasts] = useState<ToastItem[]>([]);
	const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
	const notificationsRef = useRef(false);
	const addToastRef = useRef<
		(message: string, type: ToastItem["type"]) => void
	>(() => {});

	useEffect(() => {
		notificationsRef.current = notificationsOn;
	}, [notificationsOn]);

	useEffect(() => {
		addToastRef.current = addToast;
	});

	useEffect(() => {
		const savedPreference = localStorage.getItem("admin-notify") === "true";
		setNotificationsOn(savedPreference);
		notificationsRef.current = savedPreference;
	}, []);

	function removeToast(id: number) {
		setToasts((current) => current.filter((toast) => toast.id !== id));
	}

	function addToast(message: string, type: ToastItem["type"]) {
		const id = ++toastCounter;
		setToasts((current) => [...current, { id, message, type }]);

		window.setTimeout(() => {
			removeToast(id);
		}, 5000);
	}

	function fireNativeNotification(title: string, body: string) {
		if (
			typeof window !== "undefined" &&
			Notification.permission === "granted"
		) {
			new Notification(title, { body });
		}
	}

	function markLive(id: string) {
		setLiveSessions((current) => new Set([...current, id]));

		window.setTimeout(
			() => {
				setLiveSessions((current) => {
					const next = new Set(current);
					next.delete(id);
					return next;
				});
			},
			5 * 60 * 1000,
		);
	}

	async function fetchSessions() {
		setLoading(true);

		try {
			const response = await fetch("/api/admin/sessions");
			const data = await response.json();
			setSessions(Array.isArray(data) ? data : []);
		} catch {
			setSessions([]);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		fetchSessions();
	}, []);

	useEffect(() => {
		const supabase = createClient();

		const channel = supabase
			.channel("admin-sessions-realtime")
			.on(
				"postgres_changes",
				{ event: "INSERT", schema: "public", table: "sessions" },
				(payload) => {
					const session = rowToSummary(payload.new);

					setSessions((current) => [session, ...current]);
					markLive(session.id);

					if (notificationsRef.current) {
						addToastRef.current(
							"Có phiên chat mới vừa được ghi nhận.",
							"session",
						);
						fireNativeNotification("Admin", "Có phiên chat mới");
					}
				},
			)
			.on(
				"postgres_changes",
				{ event: "UPDATE", schema: "public", table: "sessions" },
				(payload) => {
					const session = rowToSummary(payload.new);

					setSessions((current) =>
						current
							.map((item) => (item.id === session.id ? session : item))
							.sort(
								(a, b) =>
									new Date(b.updatedAt).getTime() -
									new Date(a.updatedAt).getTime(),
							),
					);

					markLive(session.id);

					const hadLead = payload.old?.lead;
					const newLead = payload.new?.lead;

					if (!hadLead && newLead && notificationsRef.current) {
						const name = newLead.full_name ?? "Khách hàng mới";
						const exam = newLead.target_exam ? ` (${newLead.target_exam})` : "";
						const message = `Lead mới: ${name}${exam}`;
						addToastRef.current(message, "lead");
						fireNativeNotification("Admin", message);
					}

					const wasSupport = payload.old?.needs_support;
					const nowSupport = payload.new?.needs_support;

					if (!wasSupport && nowSupport) {
						const name = payload.new?.lead?.full_name ?? "Khách hàng";
						const message = `${name} đang cần tư vấn chuyên sâu.`;
						addToastRef.current(message, "support");
						fireNativeNotification("Hỗ trợ ngay", message);
					}
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, []);

	async function toggleNotifications() {
		if (notificationsOn) {
			setNotificationsOn(false);
			localStorage.setItem("admin-notify", "false");
			return;
		}

		if ("Notification" in window && Notification.permission === "default") {
			await Notification.requestPermission();
		}

		setNotificationsOn(true);
		localStorage.setItem("admin-notify", "true");
		addToast("Đã bật thông báo cho khu admin.", "session");
	}

	const orderedSessions = [...sessions].sort((a, b) => {
		if (a.needsSupport && !b.needsSupport) return -1;
		if (!a.needsSupport && b.needsSupport) return 1;

		return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
	});

	const sidebarProps: AdminSidebarProps = {
		loading,
		pathname,
		sessions: orderedSessions,
		liveSessions,
		notificationsOn,
		onRefresh: fetchSessions,
		onToggleNotifications: toggleNotifications,
		onNavigate: () => setMobileSidebarOpen(false),
	};

	const currentSectionLabel = getCurrentSectionLabel(pathname);

	return (
		<div className="saas-shell relative isolate h-screen overflow-hidden text-foreground">
			<div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
				<div className="size-[50rem] rounded-full bg-primary/12 blur-[120px] glow-orb" />
			</div>
			<div
				className="pointer-events-none absolute -left-20 top-40 size-80 rounded-full bg-[oklch(0.58_0.24_300/0.10)] blur-[100px] glow-orb"
				style={{ animationDelay: "1s" }}
			/>
			<div
				className="pointer-events-none absolute -right-10 top-[28rem] size-96 rounded-full bg-[oklch(0.54_0.20_250/0.08)] blur-[100px] glow-orb"
				style={{ animationDelay: "2s" }}
			/>

			<div className="flex h-full gap-4 p-4">
				<aside className="hidden h-full w-[22rem] shrink-0 lg:block">
					<AdminSidebar {...sidebarProps} />
				</aside>

				<Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
					<SheetContent
						side="left"
						showCloseButton={false}
						className="w-[min(92vw,22rem)] border-r bg-background/95 p-0 backdrop-blur"
					>
						<SheetHeader className="sr-only">
							<SheetTitle>Admin navigation</SheetTitle>
						</SheetHeader>
						<AdminSidebar {...sidebarProps} />
					</SheetContent>
				</Sheet>

				<div className="flex min-w-0 flex-1 flex-col gap-4">
					<div className="saas-card flex items-center justify-between px-4 py-3 lg:hidden">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => setMobileSidebarOpen(true)}
						>
							<PanelLeft data-icon="inline-start" />
							Menu
						</Button>

						<div className="min-w-0 text-right">
							<p className="truncate text-sm font-medium">
								{currentSectionLabel}
							</p>
							<p className="truncate text-xs text-muted-foreground">
								{liveSessions.size > 0
									? `${liveSessions.size} phiên đang trực tiếp`
									: "Admin workspace"}
							</p>
						</div>
					</div>

					<main className="saas-panel flex min-h-0 flex-1 flex-col overflow-hidden">
						{children}
					</main>
				</div>
			</div>

			<div className="pointer-events-none fixed inset-x-4 top-4 z-50 flex flex-col items-end gap-3 sm:left-auto sm:right-4 sm:w-[24rem]">
				{toasts.map((toast) => (
					<div
						key={toast.id}
						className={cn(
							"pointer-events-auto saas-card w-full p-4",
							toast.type === "support" && "border-destructive/30",
							toast.type === "lead" && "border-border",
						)}
					>
						<div className="flex items-start gap-3">
							<Badge
								variant={
									toast.type === "support"
										? "destructive"
										: toast.type === "lead"
											? "secondary"
											: "outline"
								}
							>
								{toast.type === "support"
									? "Ưu tiên"
									: toast.type === "lead"
										? "Lead"
										: "Mới"}
							</Badge>

							<div className="flex min-w-0 flex-1 flex-col gap-1">
								<p className="text-sm font-medium">Admin notification</p>
								<p className="text-sm leading-6 text-muted-foreground">
									{toast.message}
								</p>
							</div>

							<Button
								type="button"
								variant="ghost"
								size="icon-xs"
								onClick={() => removeToast(toast.id)}
							>
								<X />
								<span className="sr-only">Đóng thông báo</span>
							</Button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
