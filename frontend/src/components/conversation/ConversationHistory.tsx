import React, { useState, useEffect } from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Typography, 
  Divider, 
  Chip, 
  Button, 
  Skeleton,
  IconButton,
  Menu,
  MenuItem,
  Pagination
} from '@mui/material';
import ArchiveIcon from '@mui/icons-material/Archive';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ChatIcon from '@mui/icons-material/Chat';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import { useNavigate } from 'react-router-dom';
import { useConversation } from '../../hooks/useConversation';

interface ConversationHistoryProps {
  showArchived?: boolean;
  maxItems?: number;
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  showArchived = false,
  maxItems
}) => {
  const { 
    conversations, 
    isLoading, 
    pagination, 
    archiveConversation, 
    fetchConversations 
  } = useConversation();
  
  const [page, setPage] = useState(1);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  
  const navigate = useNavigate();
  
  // 会話一覧を取得
  useEffect(() => {
    fetchConversations({
      page,
      limit: maxItems || 10,
      isArchived: showArchived
    });
  }, [page, showArchived]);
  
  // メニューを開く
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, conversationId: string) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedConversation(conversationId);
  };
  
  // メニューを閉じる
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedConversation(null);
  };
  
  // 会話をアーカイブ/アーカイブ解除
  const handleArchiveToggle = async () => {
    if (selectedConversation) {
      await archiveConversation(selectedConversation);
      handleMenuClose();
    }
  };
  
  // 会話を開く
  const handleOpenConversation = (conversationId: string) => {
    navigate(`/conversation/${conversationId}`);
  };
  
  // ページ変更
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  
  // プレースホルダーリストアイテム
  const renderSkeletonItems = () => {
    return Array(maxItems || 3).fill(0).map((_, index) => (
      <React.Fragment key={`skeleton-${index}`}>
        <ListItem alignItems="flex-start" sx={{ py: 2 }}>
          <ListItemAvatar>
            <Skeleton variant="circular" width={40} height={40} />
          </ListItemAvatar>
          <ListItemText
            primary={<Skeleton width="60%" />}
            secondary={<Skeleton width="90%" />}
          />
        </ListItem>
        {index < (maxItems || 3) - 1 && <Divider component="li" />}
      </React.Fragment>
    ));
  };
  
  // 会話のプレビューテキストを取得（短く整形）
  const getPreviewText = (text: string) => {
    return text.length > 100 ? `${text.substring(0, 100)}...` : text;
  };
  
  // 日付をフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // 今日の場合は時刻のみ
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // 昨日の場合
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return '昨日';
    }
    
    // それ以外は日付
    return date.toLocaleDateString();
  };
  
  return (
    <Box>
      {/* ヘッダー */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2
        }}
      >
        <Typography variant="h6" component="h2">
          {showArchived ? 'アーカイブ済み会話' : '会話履歴'}
        </Typography>
        
        {/* アーカイブ/アクティブ切り替えボタン */}
        <Button
          startIcon={showArchived ? <ChatIcon /> : <ArchiveOutlinedIcon />}
          size="small"
          onClick={() => navigate(showArchived ? '/conversations' : '/conversations/archived')}
          sx={{ textTransform: 'none' }}
        >
          {showArchived ? 'アクティブな会話' : 'アーカイブ済み'}
        </Button>
      </Box>
      
      {/* 会話リスト */}
      <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
        {isLoading ? (
          renderSkeletonItems()
        ) : conversations.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="textSecondary">
              {showArchived 
                ? 'アーカイブ済みの会話はありません'
                : '会話履歴がありません'}
            </Typography>
            {!showArchived && (
              <Button
                variant="outlined"
                onClick={() => navigate('/conversation')}
                sx={{ mt: 2 }}
              >
                新しい会話を始める
              </Button>
            )}
          </Box>
        ) : (
          conversations.map((conversation, index) => {
            // 最新のメッセージを取得
            const lastMessage = conversation.messages && conversation.messages.length > 0
              ? conversation.messages[conversation.messages.length - 1]
              : null;
            
            return (
              <React.Fragment key={conversation.id}>
                <ListItem 
                  alignItems="flex-start" 
                  sx={{ 
                    py: 2,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                  onClick={() => handleOpenConversation(conversation.id)}
                >
                  <ListItemAvatar>
                    <Avatar
                      alt="五行アシスタント"
                      src="/assets/avatar.png"
                      sx={{ 
                        bgcolor: lastMessage?.sender === 'user' ? 'primary.light' : 'primary.main'
                      }}
                    >
                      {lastMessage?.sender === 'user' ? 'U' : '五'}
                    </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <Typography component="span" variant="subtitle1">
                          {conversation.messageCount 
                            ? `会話 (${conversation.messageCount}件のメッセージ)`
                            : '新しい会話'}
                        </Typography>
                        <Typography component="span" variant="caption" color="text.secondary">
                          {formatDate(conversation.updatedAt)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          sx={{ 
                            display: 'block',
                            mt: 0.5,
                            mb: 1,
                            opacity: lastMessage ? 1 : 0.6
                          }}
                        >
                          {lastMessage 
                            ? getPreviewText(lastMessage.content)
                            : '会話内容がありません'}
                        </Typography>
                        
                        {/* タグやステータス表示 */}
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                          {conversation.context?.fortuneId && (
                            <Chip 
                              label="運勢関連" 
                              size="small" 
                              sx={{ mr: 1, mb: 0.5, fontSize: '0.7rem' }} 
                            />
                          )}
                          {conversation.context?.teamRelated && (
                            <Chip 
                              label="チーム関連" 
                              size="small" 
                              sx={{ mr: 1, mb: 0.5, fontSize: '0.7rem' }} 
                            />
                          )}
                          {showArchived && (
                            <Chip 
                              icon={<ArchiveIcon fontSize="small" />}
                              label="アーカイブ済み" 
                              size="small" 
                              sx={{ mr: 1, mb: 0.5, fontSize: '0.7rem' }} 
                            />
                          )}
                        </Box>
                      </React.Fragment>
                    }
                  />
                  
                  {/* アクションメニュー */}
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, conversation.id)}
                    sx={{ alignSelf: 'flex-start', mt: 1 }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </ListItem>
                {index < conversations.length - 1 && <Divider component="li" />}
              </React.Fragment>
            );
          })
        )}
      </List>
      
      {/* ページネーション */}
      {!isLoading && pagination && pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={pagination.totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="medium"
          />
        </Box>
      )}
      
      {/* アクションメニュー */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleArchiveToggle}>
          {showArchived ? (
            <>
              <UnarchiveIcon fontSize="small" sx={{ mr: 1 }} />
              アーカイブ解除
            </>
          ) : (
            <>
              <ArchiveOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
              アーカイブする
            </>
          )}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ConversationHistory;