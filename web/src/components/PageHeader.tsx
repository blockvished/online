// components/PageHeader.tsx

interface PageHeaderProps {
  title: string;
  icon?: string;
}

export const PageHeader = ({ title, icon = "🔒" }: PageHeaderProps) => {
  return (
    <h1 className="text-5xl font-extrabold mb-12 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 shadow-text-lg">
      {icon} {title}
    </h1>
  );
};
