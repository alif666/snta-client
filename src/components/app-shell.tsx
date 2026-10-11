"use client";

import {
  BarChart3,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  LogOut,
  Menu,
  MoreHorizontal,
  PenLine,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  createNoteAction,
  createPostAction,
  createUserAction,
  deleteNoteAction,
  deletePostAction,
  deleteUserAction,
  listInterestMetricsAction,
  listNotesAction,
  listPublicPostsAction,
  listUserPostsAction,
  listUsersAction,
  updateNoteAction,
  updatePostAction,
  updateUserAction,
} from "@/lib/actions";
import { loginAction, registerAction } from "@/lib/actions";
import type { InterestMetric, Note, Post, User } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { Avatar, EmptyState, FormError, Modal } from "@/components/ui";

type ModalKind = "note" | "post" | "user" | null;

export function AppShell() {
  const { session, activeView, setActiveView, setSession, clearSession } =
    useAppStore();
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authMessage, setAuthMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [publicPosts, setPublicPosts] = useState<Post[]>([]);
  const [publicLoading, setPublicLoading] = useState(true);
  const [modal, setModal] = useState<ModalKind>(null);
  const [editingItem, setEditingItem] = useState<Note | Post | User | null>(
    null,
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const [postScope, setPostScope] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    void listPublicPostsAction(1, 6).then((result) => {
      setPublicPosts(result.data?.posts ?? []);
      setPublicLoading(false);
    });
  }, []);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  }

  if (!session) {
    return (
      <PublicHome
        posts={publicPosts}
        loading={publicLoading}
        authMode={authMode}
        setAuthMode={setAuthMode}
        message={authMessage}
        loadingAuth={authLoading}
        onAuth={async (input) => {
          setAuthLoading(true);
          setAuthMessage("");
          if (input.mode === "login") {
            const result = await loginAction(
              input.values as { email: string; password: string },
            );
            if (result.success && result.data) {
              setSession({
                accessToken: result.data.accessToken,
                user: result.data.user,
              });
              setAuthMessage("");
            } else {
              setAuthMessage(
                result.message ?? "Please check your details and try again.",
              );
            }
          } else {
            const result = await registerAction(
              input.values as {
                name: string;
                email: string;
                password: string;
                interests: string[];
              },
            );
            if (result.success) {
              setAuthMode("login");
              setAuthMessage(
                "Account created. Sign in to open your workspace.",
              );
            } else {
              setAuthMessage(
                result.message ?? "Please check your details and try again.",
              );
            }
          }
          setAuthLoading(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <DashboardNav
        activeView={activeView}
        setActiveView={setActiveView}
        user={session.user}
        onLogout={clearSession}
      />
      <main className="mx-auto max-w-[1440px] px-4 pb-12 pt-24 sm:px-6 lg:px-10">
        {activeView === "overview" && (
          <Overview
            user={session.user}
            setActiveView={setActiveView}
            onCreate={() => setModal("note")}
          />
        )}
        {activeView === "notes" && (
          <NotesView
            refreshKey={refreshKey}
            session={session}
            onNotify={notify}
            openModal={(item) => {
              setEditingItem(item);
              setModal("note");
            }}
            onCreate={() => {
              setEditingItem(null);
              setModal("note");
            }}
          />
        )}
        {activeView === "posts" && (
          <PostsView
            refreshKey={refreshKey}
            scope={postScope}
            clearScope={() => setPostScope(null)}
            session={session}
            onNotify={notify}
            openModal={(item) => {
              setEditingItem(item);
              setModal("post");
            }}
            onCreate={() => {
              setEditingItem(null);
              setModal("post");
            }}
          />
        )}
        {activeView === "users" && session.user.role === "admin" && (
          <UsersView
            session={session}
            onNotify={notify}
            onViewPosts={(user) => {
              setPostScope({ id: user.id, name: user.name });
              setActiveView("posts");
            }}
            openModal={(item) => {
              setEditingItem(item);
              setModal("user");
            }}
            onCreate={() => {
              setEditingItem(null);
              setModal("user");
            }}
          />
        )}
        {activeView === "analytics" && session.user.role === "admin" && (
          <AnalyticsView session={session} />
        )}
      </main>
      <Modal
        open={modal === "note"}
        title={editingItem ? "Edit note" : "Capture a note"}
        eyebrow="Private by default"
        onClose={() => setModal(null)}
      >
        <NoteForm
          token={session.accessToken}
          note={editingItem as Note | null}
          onDone={() => {
            setModal(null);
            setRefreshKey((key) => key + 1);
            notify(editingItem ? "Note updated" : "Note created");
          }}
        />
      </Modal>
      <Modal
        open={modal === "post"}
        title={editingItem ? "Edit post" : "Share a thought"}
        eyebrow="Visible to everyone"
        onClose={() => setModal(null)}
      >
        <PostForm
          token={session.accessToken}
          post={editingItem as Post | null}
          onDone={() => {
            setModal(null);
            setRefreshKey((key) => key + 1);
            notify(editingItem ? "Post updated" : "Post published");
          }}
        />
      </Modal>
      {session.user.role === "admin" && (
        <Modal
          open={modal === "user"}
          title={editingItem ? "Edit member" : "Add a member"}
          eyebrow="Admin workspace"
          onClose={() => setModal(null)}
        >
          <UserForm
            token={session.accessToken}
            user={editingItem as User | null}
            onDone={() => {
              setModal(null);
              setRefreshKey((key) => key + 1);
              notify(editingItem ? "Member updated" : "Member added");
            }}
          />
        </Modal>
      )}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-2xl bg-ink px-5 py-4 text-sm font-semibold text-white shadow-soft">
          <Check size={17} className="text-mint" />
          {toast}
        </div>
      )}
    </div>
  );
}

function PublicHome({
  posts,
  loading,
  authMode,
  setAuthMode,
  message,
  loadingAuth,
  onAuth,
}: {
  posts: Post[];
  loading: boolean;
  authMode: "login" | "register";
  setAuthMode: (mode: "login" | "register") => void;
  message: string;
  loadingAuth: boolean;
  onAuth: (input: {
    mode: "login" | "register";
    values: Record<string, unknown>;
  }) => Promise<void>;
}) {
  return (
    <div className="min-h-screen overflow-hidden">
      <header className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Brand />
        <div className="flex items-center gap-2 text-sm font-semibold text-[#6b7d73]">
          <span className="hidden sm:inline">A quieter place to think</span>
          <span className="h-2 w-2 rounded-full bg-coral" />
        </div>
      </header>
      <main className="mx-auto max-w-[1440px] px-5 pb-20 sm:px-8 lg:px-12">
        <section className="grid items-center gap-12 pb-20 pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:pt-20">
          <div>
            <p className="eyebrow mb-5">Secure note-taking application</p>
            <h1 className="max-w-3xl text-5xl font-bold leading-[1.02] tracking-[-0.06em] text-ink sm:text-7xl">
              Make room for
              <br />
              <span className="text-sage">better thoughts.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#697b71]">
              Luma gives your notes a private home and your best ideas a
              beautiful way to travel. Write freely, share thoughtfully, stay in
              control.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4 text-sm font-semibold text-[#6c7f74]">
              <span className="flex items-center gap-2">
                <ShieldCheck size={17} className="text-sage" /> Secure by design
              </span>
              <span className="flex items-center gap-2">
                <Sparkles size={17} className="text-coral" /> Built for clarity
              </span>
            </div>
          </div>
          <AuthCard
            mode={authMode}
            setMode={setAuthMode}
            message={message}
            loading={loadingAuth}
            onSubmit={onAuth}
          />
        </section>
        <section className="border-t border-[#dfe9e2] pt-12">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <p className="eyebrow mb-2">The public room</p>
              <h2 className="text-3xl font-bold tracking-tight">
                Ideas worth sharing
              </h2>
            </div>
            <p className="hidden max-w-xs text-right text-sm leading-6 text-[#7a8b82] sm:block">
              A glimpse into the community. Your private notes remain yours.
            </p>
          </div>
          {loading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-48 animate-pulse rounded-3xl bg-white/70"
                />
              ))}
            </div>
          ) : posts.length ? (
            <div className="grid gap-4 md:grid-cols-3">
              {posts.slice(0, 3).map((post) => (
                <PublicPostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="The room is waiting"
              text="Be the first person to share a thoughtful post."
            />
          )}
        </section>
      </main>
      <footer className="mx-auto flex max-w-[1440px] justify-between border-t border-[#dfe9e2] px-5 py-7 text-xs font-semibold uppercase tracking-[0.15em] text-[#91a198] sm:px-8 lg:px-12">
        <span>© 2026 Luma</span>
        <span>Private notes · Public ideas</span>
      </footer>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink text-lg text-mint">
        ✦
      </span>
      <span className="text-lg font-bold tracking-tight">
        luma<span className="text-sage">.</span>
      </span>
    </div>
  );
}

function AuthCard({
  mode,
  setMode,
  message,
  loading,
  onSubmit,
}: {
  mode: "login" | "register";
  setMode: (mode: "login" | "register") => void;
  message: string;
  loading: boolean;
  onSubmit: (input: {
    mode: "login" | "register";
    values: Record<string, unknown>;
  }) => Promise<void>;
}) {
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    interests: "",
  });
  return (
    <div className="panel mx-auto w-full max-w-md p-6 sm:p-8">
      <div className="mb-7 flex rounded-xl bg-[#f0f5f1] p-1 text-sm font-semibold">
        <button
          onClick={() => setMode("login")}
          className={cnTab(mode === "login")}
        >
          Sign in
        </button>
        <button
          onClick={() => setMode("register")}
          className={cnTab(mode === "register")}
        >
          Create account
        </button>
      </div>
      <div className="mb-6">
        <p className="eyebrow mb-2">
          {mode === "login" ? "Welcome back" : "Start fresh"}
        </p>
        <h2 className="text-2xl font-bold tracking-tight">
          {mode === "login" ? "Open your workspace" : "Create your space"}
        </h2>
      </div>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit({
            mode,
            values: {
              ...values,
              interests: values.interests
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            },
          });
        }}
      >
        {mode === "register" && (
          <input
            className="field"
            placeholder="Your name"
            required
            value={values.name}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
          />
        )}
        <input
          className="field"
          type="email"
          placeholder="Email address"
          required
          value={values.email}
          onChange={(e) => setValues({ ...values, email: e.target.value })}
        />
        <input
          className="field"
          type="password"
          placeholder="Password"
          minLength={8}
          required
          value={values.password}
          onChange={(e) => setValues({ ...values, password: e.target.value })}
        />
        {mode === "register" && (
          <input
            className="field"
            placeholder="Interests · separate with commas"
            value={values.interests}
            onChange={(e) =>
              setValues({ ...values, interests: e.target.value })
            }
          />
        )}
        <FormError message={message} />
        <button className="button-primary w-full" disabled={loading}>
          {loading
            ? "One moment…"
            : mode === "login"
              ? "Enter workspace"
              : "Create account"}
        </button>
      </form>
      <p className="mt-5 text-center text-xs leading-5 text-[#899890]">
        By continuing, you agree to keep this space respectful and secure.
      </p>
    </div>
  );
}

function cnTab(active: boolean) {
  return `flex-1 rounded-lg px-3 py-2.5 transition ${active ? "bg-white text-ink shadow-sm" : "text-[#829189]"}`;
}

function DashboardNav({
  activeView,
  setActiveView,
  user,
  onLogout,
}: {
  activeView: string;
  setActiveView: (
    view: "overview" | "notes" | "posts" | "users" | "analytics",
  ) => void;
  user: User;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const items = [
    { id: "overview" as const, label: "Overview", icon: Sparkles },
    { id: "notes" as const, label: "My notes", icon: FileText },
    { id: "posts" as const, label: "Public posts", icon: BookOpen },
    ...(user.role === "admin"
      ? [
          { id: "users" as const, label: "Members", icon: Users },
          { id: "analytics" as const, label: "Insights", icon: BarChart3 },
        ]
      : []),
  ];
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/70 bg-[#f4f7f5]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10">
        <Brand />
        <nav
          className={`${open ? "absolute left-4 right-4 top-[68px] flex" : "hidden"} panel flex-col gap-1 p-2 md:static md:flex md:flex-row md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
        >
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                setOpen(false);
              }}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${activeView === item.id ? "bg-white text-ink shadow-sm" : "text-[#75857c] hover:bg-white/70 hover:text-ink"}`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
          <button
            onClick={onLogout}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-[#75857c] hover:bg-white/70 hover:text-ink md:hidden"
          >
            <LogOut size={16} /> Sign out
          </button>
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-3 border-l border-[#dce6df] pl-4 sm:flex">
            <Avatar name={user.name} size="sm" />
            <div className="leading-tight">
              <p className="text-sm font-bold">{user.name}</p>
              <p className="text-[0.68rem] uppercase tracking-wider text-sage">
                {user.role}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="button-ghost p-2"
              title="Sign out"
            >
              <LogOut size={17} />
            </button>
          </div>
          <button
            className="button-ghost p-2 md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}

function Overview({
  user,
  setActiveView,
  onCreate,
}: {
  user: User;
  setActiveView: (
    view: "overview" | "notes" | "posts" | "users" | "analytics",
  ) => void;
  onCreate: () => void;
}) {
  const cards = [
    {
      label: "Private notes",
      text: "Capture what matters",
      icon: FileText,
      view: "notes" as const,
      color: "bg-mint",
    },
    {
      label: "Public posts",
      text: "Share your thinking",
      icon: BookOpen,
      view: "posts" as const,
      color: "bg-[#ffe0d7]",
    },
    ...(user.role === "admin"
      ? [
          {
            label: "Team insights",
            text: "See the bigger picture",
            icon: BarChart3,
            view: "analytics" as const,
            color: "bg-[#fff0bd]",
          },
        ]
      : []),
  ];
  return (
    <>
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="eyebrow mb-3">
            {new Date().toLocaleDateString("en", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
            Good to see you,
            <br />
            <span className="text-sage">{user.name.split(" ")[0]}.</span>
          </h1>
        </div>
        <button onClick={onCreate} className="button-primary">
          <Plus size={17} /> New note
        </button>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {cards.map((card) => (
          <button
            key={card.label}
            onClick={() => setActiveView(card.view)}
            className="panel group p-6 text-left transition hover:-translate-y-1"
          >
            <div
              className={`mb-10 flex h-11 w-11 items-center justify-center rounded-2xl ${card.color}`}
            >
              <card.icon size={20} />
            </div>
            <p className="text-lg font-bold">{card.label}</p>
            <p className="mt-1 text-sm text-[#7c8c84]">{card.text}</p>
            <div className="mt-7 flex items-center gap-2 text-xs font-bold text-sage">
              Open collection{" "}
              <ChevronRight
                size={14}
                className="transition group-hover:translate-x-1"
              />
            </div>
          </button>
        ))}
      </div>
      <section className="mt-12 grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="panel overflow-hidden bg-ink p-7 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="eyebrow text-mint">A small ritual</p>
              <h2 className="mt-3 max-w-lg text-3xl font-bold leading-tight">
                The best ideas rarely arrive on schedule.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/60">
                Keep a place ready for them. Luma makes the act of noticing feel
                effortless.
              </p>
            </div>
            <span className="text-4xl text-sun">✦</span>
          </div>
          <button onClick={onCreate} className="button-soft mt-8">
            Write something <PenLine size={16} />
          </button>
        </div>
        <div className="panel p-7">
          <p className="eyebrow mb-5">Your interests</p>
          <div className="flex flex-wrap gap-2">
            {user.interests.length ? (
              user.interests.map((interest) => (
                <span
                  key={interest}
                  className="rounded-full bg-[#eef5f0] px-3 py-2 text-xs font-bold text-[#5f7769]"
                >
                  #{interest}
                </span>
              ))
            ) : (
              <p className="text-sm text-[#7b8b82]">
                Add interests to make your profile feel like you.
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHeader({
  eyebrow,
  title,
  action,
  onAction,
}: {
  eyebrow: string;
  title: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="eyebrow mb-2">{eyebrow}</p>
        <h1 className="text-4xl font-bold tracking-[-0.04em]">{title}</h1>
      </div>
      <button
        onClick={onAction}
        className="button-primary self-start sm:self-auto"
      >
        <Plus size={16} />
        {action}
      </button>
    </div>
  );
}

function NotesView({
  refreshKey,
  session,
  onNotify,
  openModal,
  onCreate,
}: {
  refreshKey: number;
  session: { accessToken: string; user: User };
  onNotify: (message: string) => void;
  openModal: (item: Note) => void;
  onCreate: () => void;
}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    void listNotesAction(session.accessToken).then((result) => {
      if (!active) return;
      setNotes(result.data?.notes ?? []);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [session.accessToken, refreshKey]);
  async function remove(id: string) {
    if (!window.confirm("Delete this note permanently?")) return;
    const result = await deleteNoteAction(session.accessToken, id);
    if (result.success) {
      setNotes((current) => current.filter((note) => note.id !== id));
      onNotify("Note deleted");
    } else onNotify(result.message ?? "Unable to delete note");
  }
  return (
    <>
      <SectionHeader
        eyebrow="Your private collection"
        title="Notes"
        action="New note"
        onAction={onCreate}
      />
      {loading ? (
        <LoadingRows />
      ) : notes.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <article
              key={note.id}
              className="panel group flex min-h-[220px] flex-col p-6"
            >
              <div className="mb-5 flex items-start justify-between">
                <span className="rounded-full bg-mint px-3 py-1 text-[0.68rem] font-bold uppercase tracking-wider text-[#56806b]">
                  Private
                </span>
                <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                  <button
                    className="button-ghost p-2"
                    onClick={() => openModal(note)}
                  >
                    <PenLine size={15} />
                  </button>
                  <button
                    className="button-ghost p-2 text-coral"
                    onClick={() => void remove(note.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-bold">{note.title}</h3>
              <p className="mt-3 line-clamp-4 text-sm leading-6 text-[#708078]">
                {note.content}
              </p>
              <p className="mt-auto pt-7 text-xs font-semibold text-[#a0aca5]">
                Updated {formatDate(note.updatedAt)}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Your notebook is empty"
          text="Start with a thought, a question, or something you want to remember."
        />
      )}
    </>
  );
}

function PostsView({
  refreshKey,
  scope,
  clearScope,
  session,
  onNotify,
  openModal,
  onCreate,
}: {
  refreshKey: number;
  scope: { id: string; name: string } | null;
  clearScope: () => void;
  session: { accessToken: string; user: User };
  onNotify: (message: string) => void;
  openModal: (item: Post) => void;
  onCreate: () => void;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    const request = scope
      ? listUserPostsAction(scope.id, 1, 50)
      : listPublicPostsAction(1, 50);
    void request.then((result) => {
      if (!active) return;
      setPosts(result.data?.posts ?? []);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [refreshKey, scope]);
  async function remove(id: string) {
    if (!window.confirm("Remove this post?")) return;
    const result = await deletePostAction(session.accessToken, id);
    if (result.success) {
      setPosts((current) => current.filter((post) => post.id !== id));
      onNotify("Post removed");
    } else onNotify(result.message ?? "Unable to remove post");
  }
  return (
    <>
      <SectionHeader
        eyebrow={scope ? `Posts by ${scope.name}` : "The public room"}
        title={scope ? "Member posts" : "Posts"}
        action="Share a thought"
        onAction={onCreate}
      />
      {scope && (
        <button className="button-ghost mb-5 pl-0" onClick={clearScope}>
          <ChevronLeft size={16} /> Back to all posts
        </button>
      )}
      <div className="mb-8 rounded-3xl bg-ink p-7 text-white sm:p-9">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="eyebrow text-mint">Open conversation</p>
            <h2 className="mt-3 text-3xl font-bold">
              Ideas travel further
              <br />
              when they are shared.
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-6 text-white/55">
            Read what the community is thinking. Everyone can explore; only you
            control your own words.
          </p>
        </div>
      </div>
      {loading ? (
        <LoadingRows />
      ) : posts.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {posts.map((post) => (
            <article key={post.id} className="panel group p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={post.author.name} size="sm" />
                  <div>
                    <p className="text-sm font-bold">{post.author.name}</p>
                    <p className="text-xs text-[#91a098]">
                      {formatDate(post.createdAt)}
                    </p>
                  </div>
                </div>
                {post.author.id === session.user.id ||
                session.user.role === "admin" ? (
                  <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                    <button
                      className="button-ghost p-2"
                      onClick={() => openModal(post)}
                    >
                      <PenLine size={15} />
                    </button>
                    <button
                      className="button-ghost p-2 text-coral"
                      onClick={() => void remove(post.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ) : (
                  <MoreHorizontal size={18} className="text-[#a2afa8]" />
                )}
              </div>
              <h3 className="mt-6 text-2xl font-bold tracking-tight">
                {post.title}
              </h3>
              <p className="mt-3 line-clamp-4 text-sm leading-7 text-[#6f8077]">
                {post.content}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No public posts yet"
          text="Share the first thoughtful idea with the room."
        />
      )}
    </>
  );
}

function UsersView({
  session,
  onNotify,
  openModal,
  onCreate,
  onViewPosts,
}: {
  session: { accessToken: string; user: User };
  onNotify: (message: string) => void;
  openModal: (item: User) => void;
  onCreate: () => void;
  onViewPosts: (user: User) => void;
}) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    void listUsersAction(session.accessToken).then((result) => {
      if (!active) return;
      setUsers(result.data?.users ?? []);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [session.accessToken]);
  async function remove(id: string) {
    if (!window.confirm("Remove this member?")) return;
    const result = await deleteUserAction(session.accessToken, id);
    if (result.success) {
      setUsers((current) => current.filter((user) => user.id !== id));
      onNotify("Member removed");
    } else onNotify(result.message ?? "Unable to remove member");
  }
  return (
    <>
      <SectionHeader
        eyebrow="Admin workspace"
        title="Members"
        action="Add member"
        onAction={onCreate}
      />
      <div className="panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#e7eee9] px-5 py-4">
          <p className="text-sm font-semibold text-[#73847a]">
            {users.length} registered members
          </p>
          <div className="flex items-center gap-2 rounded-xl bg-[#f4f8f5] px-3 py-2 text-xs text-[#8a9890]">
            <Search size={14} /> Search-ready directory
          </div>
        </div>
        {loading ? (
          <LoadingRows />
        ) : (
          <div className="divide-y divide-[#edf1ee]">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={user.name} size="sm" />
                  <div>
                    <p className="text-sm font-bold">{user.name}</p>
                    <p className="text-xs text-[#829189]">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider ${user.role === "admin" ? "bg-[#fff0bd] text-[#97762d]" : "bg-mint text-[#56806b]"}`}
                  >
                    {user.role}
                  </span>
                  <div className="flex gap-1">
                    <button
                      className="button-ghost p-2"
                      title="View posts"
                      onClick={() => onViewPosts(user)}
                    >
                      <BookOpen size={15} />
                    </button>
                    <button
                      className="button-ghost p-2"
                      onClick={() => openModal(user)}
                    >
                      <PenLine size={15} />
                    </button>
                    {user.id !== session.user.id && (
                      <button
                        className="button-ghost p-2 text-coral"
                        onClick={() => void remove(user.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function AnalyticsView({ session }: { session: { accessToken: string } }) {
  const [metrics, setMetrics] = useState<InterestMetric[]>([]);
  useEffect(() => {
    void listInterestMetricsAction(session.accessToken).then((result) =>
      setMetrics(result.data?.interests ?? []),
    );
  }, [session.accessToken]);
  const max = Math.max(...metrics.map((metric) => metric.userCount), 1);
  return (
    <>
      <div className="mb-8">
        <p className="eyebrow mb-2">Admin workspace</p>
        <h1 className="text-4xl font-bold tracking-[-0.04em]">Insights</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[#73837a]">
          A simple view of what your members are curious about, powered by the
          interest aggregation endpoint.
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="panel bg-ink p-7 text-white">
          <p className="eyebrow text-mint">Member signals</p>
          <p className="mt-5 text-6xl font-bold">
            {metrics.reduce((sum, metric) => sum + metric.userCount, 0)}
          </p>
          <p className="mt-2 text-sm text-white/55">
            interest mentions across the directory
          </p>
          <div className="mt-10 flex items-center gap-3 text-sm text-white/75">
            <span className="h-2 w-2 rounded-full bg-sun" /> Unique members are
            counted once per interest
          </div>
        </div>
        <div className="panel p-7">
          <div className="mb-7 flex items-center justify-between">
            <div>
              <p className="eyebrow">Top interests</p>
              <h2 className="mt-2 text-xl font-bold">What people care about</h2>
            </div>
            <BarChart3 className="text-sage" />
          </div>
          {metrics.length ? (
            <div className="space-y-5">
              {metrics.map((metric) => (
                <div key={metric.interest}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-semibold">{metric.interest}</span>
                    <span className="text-[#839189]">
                      {metric.userCount}{" "}
                      {metric.userCount === 1 ? "member" : "members"}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#eaf1ec]">
                    <div
                      className="h-full rounded-full bg-sage transition-all"
                      style={{ width: `${(metric.userCount / max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No signals yet"
              text="Member interests will appear here as your directory grows."
            />
          )}
        </div>
      </div>
    </>
  );
}

function NoteForm({
  token,
  note,
  onDone,
}: {
  token: string;
  note: Note | null;
  onDone: () => void;
}) {
  return <MutationForm type="note" token={token} item={note} onDone={onDone} />;
}
function PostForm({
  token,
  post,
  onDone,
}: {
  token: string;
  post: Post | null;
  onDone: () => void;
}) {
  return <MutationForm type="post" token={token} item={post} onDone={onDone} />;
}
function MutationForm({
  type,
  token,
  item,
  onDone,
}: {
  type: "note" | "post";
  token: string;
  item: Note | Post | null;
  onDone: () => void;
}) {
  const [title, setTitle] = useState(item?.title ?? "");
  const [content, setContent] = useState(item?.content ?? "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const result =
      type === "note"
        ? item
          ? await updateNoteAction(token, item.id, { title, content })
          : await createNoteAction(token, { title, content })
        : item
          ? await updatePostAction(token, item.id, { title, content })
          : await createPostAction(token, { title, content });
    if (result.success) onDone();
    else setMessage(result.message ?? "Please check your input.");
    setLoading(false);
  }
  return (
    <form className="space-y-4" onSubmit={(event) => void submit(event)}>
      <input
        className="field"
        placeholder="A clear title"
        required
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <textarea
        className="field min-h-40 resize-y"
        placeholder="Write with intention…"
        required
        value={content}
        onChange={(event) => setContent(event.target.value)}
      />
      <FormError message={message} />
      <button className="button-primary w-full" disabled={loading}>
        {loading ? "Saving…" : item ? `Update ${type}` : `Publish ${type}`}
      </button>
    </form>
  );
}

function UserForm({
  token,
  user,
  onDone,
}: {
  token: string;
  user: User | null;
  onDone: () => void;
}) {
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("StrongPassword123");
  const [role, setRole] = useState<"user" | "admin">(user?.role ?? "user");
  const [interests, setInterests] = useState(user?.interests.join(", ") ?? "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    const interestList = interests
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const result = user
      ? await updateUserAction(token, user.id, {
          name,
          role,
          interests: interestList,
        })
      : await createUserAction(token, {
          name,
          email,
          password,
          role,
          interests: interestList,
        });
    if (result.success) onDone();
    else setMessage(result.message ?? "Please check the member details.");
    setLoading(false);
  }
  return (
    <form className="space-y-4" onSubmit={(event) => void submit(event)}>
      <input
        className="field"
        placeholder="Full name"
        required
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      {!user && (
        <input
          className="field"
          type="email"
          placeholder="Email address"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      )}
      {!user && (
        <input
          className="field"
          type="password"
          minLength={8}
          placeholder="Temporary password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      )}
      <select
        className="field"
        value={role}
        onChange={(event) => setRole(event.target.value as "user" | "admin")}
      >
        <option value="user">Regular user</option>
        <option value="admin">Administrator</option>
      </select>
      <input
        className="field"
        placeholder="Interests · separate with commas"
        value={interests}
        onChange={(event) => setInterests(event.target.value)}
      />
      <FormError message={message} />
      <button className="button-primary w-full" disabled={loading}>
        {loading ? "Saving…" : user ? "Save member" : "Add member"}
      </button>
    </form>
  );
}

function PublicPostCard({ post }: { post: Post }) {
  return (
    <article className="rounded-3xl border border-[#e4ece6] bg-white/60 p-6">
      <div className="flex items-center gap-3">
        <Avatar name={post.author.name} size="sm" />
        <div>
          <p className="text-sm font-bold">{post.author.name}</p>
          <p className="text-xs text-[#91a098]">{formatDate(post.createdAt)}</p>
        </div>
      </div>
      <h3 className="mt-6 text-xl font-bold">{post.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#75847c]">
        {post.content}
      </p>
    </article>
  );
}
function LoadingRows() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-48 animate-pulse rounded-3xl bg-white/70"
        />
      ))}
    </div>
  );
}
