"use client"
import React from "react"
import AdminSideBar from "@/components/sidebar/AdminSideBar/Admin"
import { EmailClientCard } from '@/components/ui/email-client-card';
import { Send, Trash } from 'lucide-react';

export default function Page() {
  const notifications = [
    {
      avatarSrc: 'https://i.pravatar.cc/150?img=1',
      avatarFallback: 'DM',
      senderName: 'Department Meeting',
      senderEmail: 'admin@company.com',
      timestamp: '2 hours ago',
      message: 'Supervisor provided feedback on your evaluation.',
      reactions: ['👍', '✅', '📝'],
    },
    {
      avatarSrc: 'https://i.pravatar.cc/150?img=2',
      avatarFallback: 'ED',
      senderName: 'Evaluation Due',
      senderEmail: 'system@company.com',
      timestamp: '1 day ago',
      message: 'Final evaluation is due tomorrow at 11:59 PM',
      reactions: ['⏰', '⚠️', '📅'],
    },
    {
      avatarSrc: 'https://i.pravatar.cc/150?img=3',
      avatarFallback: 'MS',
      senderName: 'Meeting Scheduled',
      senderEmail: 'calendar@company.com',
      timestamp: '2 days ago',
      message: 'Department meeting scheduled for Friday at 2:00 PM',
      reactions: ['📅', '👥', '🕐'],
    },
    {
      avatarSrc: 'https://i.pravatar.cc/150?img=4',
      avatarFallback: 'NA',
      senderName: 'New Announcement',
      senderEmail: 'hr@company.com',
      timestamp: '3 days ago',
      message: 'A new department policy has been published.',
      reactions: ['📢', '📋', '✨'],
    },
    {
      avatarSrc: 'https://i.pravatar.cc/150?img=5',
      avatarFallback: 'SU',
      senderName: 'System Update',
      senderEmail: 'it@company.com',
      timestamp: '4 days ago',
      message: 'System maintenance scheduled this weekend.',
      reactions: ['🔧', '💻', '⚙️'],
    },
    {
      avatarSrc: 'https://i.pravatar.cc/150?img=6',
      avatarFallback: 'RM',
      senderName: 'Reminder',
      senderEmail: 'notifications@company.com',
      timestamp: '5 days ago',
      message: 'Submit your weekly report before Friday.',
      reactions: ['📝', '⏰', '✅'],
    },
    {
      avatarSrc: 'https://i.pravatar.cc/150?img=7',
      avatarFallback: 'SR',
      senderName: 'Security Report',
      senderEmail: 'security@company.com',
      timestamp: '6 days ago',
      message: 'New security vulnerabilities detected in your recent scan. Please review the findings.',
      reactions: ['🔒', '⚠️', '🛡️'],
    },
    {
      avatarSrc: 'https://i.pravatar.cc/150?img=8',
      avatarFallback: 'TA',
      senderName: 'Team Achievement',
      senderEmail: 'team@company.com',
      timestamp: '1 week ago',
      message: 'Congratulations! Your team has successfully completed all security scans for this quarter.',
      reactions: ['🎉', '🏆', '👏'],
    },
    {
      avatarSrc: 'https://i.pravatar.cc/150?img=9',
      avatarFallback: 'PA',
      senderName: 'Performance Alert',
      senderEmail: 'monitoring@company.com',
      timestamp: '1 week ago',
      message: 'System performance metrics show optimal results. All services running smoothly.',
      reactions: ['📊', '✅', '🚀'],
    },
    {
      avatarSrc: 'https://i.pravatar.cc/150?img=10',
      avatarFallback: 'BU',
      senderName: 'Backup Complete',
      senderEmail: 'backup@company.com',
      timestamp: '2 weeks ago',
      message: 'Automated backup completed successfully. All data has been securely stored.',
      reactions: ['💾', '✅', '🔐'],
    },
    {
      avatarSrc: 'https://i.pravatar.cc/150?img=11',
      avatarFallback: 'LR',
      senderName: 'License Renewal',
      senderEmail: 'licensing@company.com',
      timestamp: '2 weeks ago',
      message: 'Your software license will expire in 30 days. Please renew to continue using all features.',
      reactions: ['📜', '⏰', '💳'],
    },
    {
      avatarSrc: 'https://i.pravatar.cc/150?img=12',
      avatarFallback: 'TR',
      senderName: 'Training Required',
      senderEmail: 'training@company.com',
      timestamp: '3 weeks ago',
      message: 'New security training module is now available. Complete it before the end of the month.',
      reactions: ['🎓', '📚', '✅'],
    },
  ];

  const handleReaction = (reaction) => {
    console.log(`Reacted with: ${reaction}`);
  };

  const handleAction = (index) => {
    const action = ['Send', 'Delete'][index];
    console.log(`Action clicked: ${action}`);
  };

  return (
    <div className="flex min-h-screen bg-muted/40">
      <AdminSideBar />

      <div className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Stay updated with important information
          </p>
        </div>
        
        <div className="space-y-4 w-full max-w-full">
          {notifications.map((notification, index) => (
            <EmailClientCard
              key={index}
              avatarSrc={notification.avatarSrc}
              avatarFallback={notification.avatarFallback}
              senderName={notification.senderName}
              senderEmail={notification.senderEmail}
              timestamp={notification.timestamp}
              message={notification.message}
              reactions={notification.reactions}
              onReactionClick={handleReaction}
              onActionClick={handleAction}
              actions={[
                <Send key="send" className="w-4 h-4" />,
                <Trash key="trash" className="w-4 h-4" />,
              ]}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
