/**
 * ユーザー管理テーブルコンポーネント
 * 
 * ユーザー一覧の表示と管理（編集・削除）機能を提供
 * 
 * 変更履歴:
 * - 2025/04/02: 初期実装 (Claude)
 */

import React, { useState, useEffect } from 'react';
import {
  Box, 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Tooltip,
  Menu,
  MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import Divider from '@mui/material/Divider';
import { IUser } from '../../../types';
import userService from '../../../services/user.service';

// 表示列定義
interface Column {
  id: keyof IUser | 'actions';
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any) => string;
  sortable?: boolean;
}

const columns: Column[] = [
  { id: 'name', label: '名前', minWidth: 170, sortable: true },
  { id: 'email', label: 'メールアドレス', minWidth: 170, sortable: true },
  { 
    id: 'role', 
    label: '役割', 
    minWidth: 120, 
    sortable: true,
    format: (value: string) => {
      switch (value) {
        case 'admin': return '管理者';
        case 'manager': return 'マネージャー';
        case 'employee': return '従業員';
        case 'superadmin': return 'スーパー管理者';
        case 'custom': return 'カスタム';
        default: return value;
      }
    }
  },
  { 
    id: 'isActive', 
    label: 'ステータス', 
    minWidth: 120, 
    sortable: true,
    format: (value: boolean) => value ? '有効' : '無効'
  },
  { 
    id: 'createdAt', 
    label: '作成日', 
    minWidth: 170, 
    sortable: true,
    format: (value: string | Date) => {
      const date = new Date(value);
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  },
  { id: 'actions', label: 'アクション', minWidth: 120, align: 'center' },
];

interface UserManagementTableProps {
  onAddUser?: () => void;
  onEditUser?: (user: IUser) => void;
  onUserDeleted?: () => void;
}

/**
 * ユーザー管理テーブルコンポーネント
 */
const UserManagementTable: React.FC<UserManagementTableProps> = ({ onAddUser, onEditUser, onUserDeleted }) => {
  // ユーザーデータ
  const [users, setUsers] = useState<IUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 削除確認ダイアログ
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<IUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // テーブルの状態管理
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<keyof IUser>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // フィルターメニュー
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<boolean | null>(null);

  // ユーザーデータ取得
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const userData = await userService.getAllUsers();
        setUsers(userData);
        applyFiltersAndSort(userData);
        
        setLoading(false);
      } catch (err: any) {
        console.error('ユーザー取得エラー:', err);
        setError(err.message || 'ユーザーの取得に失敗しました');
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  // 検索・ソート・フィルタリング適用
  const applyFiltersAndSort = (userList: IUser[] = users) => {
    // 検索
    let result = userList.filter(user => {
      const searchLower = searchQuery.toLowerCase();
      return (
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      );
    });
    
    // ロールフィルター適用
    if (roleFilter) {
      result = result.filter(user => user.role === roleFilter);
    }
    
    // ステータスフィルター適用
    if (statusFilter !== null) {
      result = result.filter(user => user.isActive === statusFilter);
    }
    
    // ソート
    result = [...result].sort((a, b) => {
      const valueA = a[sortBy];
      const valueB = b[sortBy];
      
      if (valueA === undefined || valueB === undefined) return 0;
      
      // 文字列の場合
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      }
      
      // 日付の場合
      if (valueA instanceof Date && valueB instanceof Date) {
        return sortDirection === 'asc' 
          ? valueA.getTime() - valueB.getTime() 
          : valueB.getTime() - valueA.getTime();
      }
      
      // 日付文字列の場合
      if (
        (typeof valueA === 'string' && !isNaN(Date.parse(valueA))) && 
        (typeof valueB === 'string' && !isNaN(Date.parse(valueB)))
      ) {
        return sortDirection === 'asc' 
          ? new Date(valueA).getTime() - new Date(valueB).getTime() 
          : new Date(valueB).getTime() - new Date(valueA).getTime();
      }
      
      // その他のケース（数値、真偽値など）
      return sortDirection === 'asc' 
        ? (valueA > valueB ? 1 : -1) 
        : (valueB > valueA ? 1 : -1);
    });
    
    setFilteredUsers(result);
  };

  // ページネーション変更ハンドラ
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // 1ページあたり表示件数変更ハンドラ
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // 検索ハンドラ
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
    applyFiltersAndSort();
  };

  // ソートハンドラ
  const handleSort = (column: Column) => {
    if (!column.sortable || column.id === 'actions') return;
    
    const isAsc = sortBy === column.id && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortBy(column.id as keyof IUser);
    
    applyFiltersAndSort();
  };

  // フィルターメニュー開閉ハンドラ
  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  // ロールフィルター設定
  const handleRoleFilter = (role: string | null) => {
    setRoleFilter(role);
    handleFilterClose();
    applyFiltersAndSort();
  };

  // ステータスフィルター設定
  const handleStatusFilter = (status: boolean | null) => {
    setStatusFilter(status);
    handleFilterClose();
    applyFiltersAndSort();
  };

  // フィルタークリア
  const handleClearFilters = () => {
    setRoleFilter(null);
    setStatusFilter(null);
    handleFilterClose();
    applyFiltersAndSort();
  };

  // 削除確認ダイアログを開く
  const handleOpenDeleteDialog = (user: IUser) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
    setDeleteError(null);
  };

  // 削除確認ダイアログを閉じる
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
    setDeleteError(null);
  };

  // ユーザー削除実行
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setDeleteLoading(true);
      setDeleteError(null);
      
      await userService.deleteUser(userToDelete.id);
      
      // 削除成功後、ユーザーリストから削除
      const updatedUsers = users.filter(user => user.id !== userToDelete.id);
      setUsers(updatedUsers);
      applyFiltersAndSort(updatedUsers);
      
      setDeleteLoading(false);
      handleCloseDeleteDialog();
      
      // 親コンポーネントに通知
      if (onUserDeleted) {
        onUserDeleted();
      }
    } catch (err: any) {
      console.error('ユーザー削除エラー:', err);
      setDeleteError(err.message || 'ユーザーの削除に失敗しました');
      setDeleteLoading(false);
    }
  };

  // ユーザー編集
  const handleEditUser = (user: IUser) => {
    if (onEditUser) {
      onEditUser(user);
    }
  };
  
  // サブスクリプション管理のためにユーザー編集機能を活用
  // editUserではユーザー情報だけでなく、サブスクリプション管理も含まれる

  // フィルターが適用されているかのフラグ
  const hasActiveFilters = !!roleFilter || statusFilter !== null;

  // 現在表示中のユーザー数
  const emptyRows = page > 0 
    ? Math.max(0, (1 + page) * rowsPerPage - filteredUsers.length) 
    : 0;

  // フィルターのアクティブ状態を表示するための色設定
  const getFilterIconColor = () => {
    return hasActiveFilters ? 'primary.main' : 'action.active';
  };

  // 検索後のフィルター適用
  useEffect(() => {
    applyFiltersAndSort();
  }, [searchQuery, sortBy, sortDirection, roleFilter, statusFilter]);

  return (
    <Box sx={{ width: '100%' }}>
      {/* テーブルツールバー */}
      <Box 
        sx={{ 
          padding: '16px', 
          display: 'flex', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Typography variant="h6" sx={{ flexGrow: 1, minWidth: '200px' }}>
          ユーザー管理
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* 検索フィールド */}
          <TextField
            size="small"
            placeholder="ユーザーを検索"
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: '250px' }}
          />
          
          {/* フィルターボタン */}
          <Tooltip title="フィルター">
            <IconButton
              onClick={handleFilterClick}
              sx={{ color: getFilterIconColor() }}
            >
              <FilterListIcon />
              {hasActiveFilters && (
                <Box 
                  component="span" 
                  sx={{ 
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: 'primary.main'
                  }} 
                />
              )}
            </IconButton>
          </Tooltip>
          
          {/* フィルターメニュー */}
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={handleFilterClose}
          >
            <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 'bold' }}>
              役割でフィルター
            </Typography>
            <MenuItem 
              onClick={() => handleRoleFilter('admin')}
              selected={roleFilter === 'admin'}
            >
              管理者
            </MenuItem>
            <MenuItem 
              onClick={() => handleRoleFilter('manager')}
              selected={roleFilter === 'manager'}
            >
              マネージャー
            </MenuItem>
            <MenuItem 
              onClick={() => handleRoleFilter('employee')}
              selected={roleFilter === 'employee'}
            >
              従業員
            </MenuItem>
            <MenuItem 
              onClick={() => handleRoleFilter(null)}
              selected={roleFilter === null}
            >
              全ての役割
            </MenuItem>
            <Divider />
            <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 'bold' }}>
              ステータスでフィルター
            </Typography>
            <MenuItem 
              onClick={() => handleStatusFilter(true)}
              selected={statusFilter === true}
            >
              有効なユーザー
            </MenuItem>
            <MenuItem 
              onClick={() => handleStatusFilter(false)}
              selected={statusFilter === false}
            >
              無効なユーザー
            </MenuItem>
            <MenuItem 
              onClick={() => handleStatusFilter(null)}
              selected={statusFilter === null}
            >
              全てのステータス
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleClearFilters}>
              全てのフィルターをクリア
            </MenuItem>
          </Menu>
          
          {/* ユーザー追加ボタン */}
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={onAddUser}
          >
            ユーザー追加
          </Button>
        </Box>
      </Box>
      
      {/* エラーメッセージ */}
      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* ユーザーテーブル */}
      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  sortDirection={sortBy === column.id ? sortDirection : false}
                  onClick={() => handleSort(column)}
                  sx={{
                    cursor: column.sortable ? 'pointer' : 'default',
                    '&:hover': {
                      backgroundColor: column.sortable ? 'rgba(0, 0, 0, 0.04)' : 'inherit',
                    },
                    fontWeight: 'bold',
                  }}
                >
                  {column.label}
                  {sortBy === column.id && (
                    <Box component="span" sx={{ ml: 1 }}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </Box>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <CircularProgress size={24} sx={{ m: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    ユーザーデータを読み込み中...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
                    {searchQuery
                      ? `"${searchQuery}" に一致するユーザーは見つかりませんでした`
                      : 'ユーザーが見つかりませんでした'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow hover key={user.id}>
                    {columns.map((column) => {
                      if (column.id === 'actions') {
                        return (
                          <TableCell key={column.id} align="center">
                            <Tooltip title="編集">
                              <IconButton 
                                size="small" 
                                onClick={() => handleEditUser(user)}
                                color="primary"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="削除">
                              <IconButton 
                                size="small" 
                                onClick={() => handleOpenDeleteDialog(user)}
                                color="error"
                                disabled={user.role === 'superadmin'}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        );
                      }
                      
                      const value = user[column.id as keyof IUser];
                      
                      if (column.id === 'isActive') {
                        return (
                          <TableCell key={column.id} align={column.align}>
                            <Chip 
                              label={value === true ? '有効' : '無効'} 
                              color={value === true ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                        );
                      }
                      
                      if (column.id === 'role') {
                        let roleColor;
                        switch (user.role) {
                          case 'admin':
                            roleColor = 'primary';
                            break;
                          case 'superadmin':
                            roleColor = 'secondary';
                            break;
                          case 'manager':
                            roleColor = 'info';
                            break;
                          case 'custom':
                            roleColor = 'warning';
                            break;
                          default:
                            roleColor = 'default';
                        }
                        
                        return (
                          <TableCell key={column.id} align={column.align}>
                            <Chip 
                              label={column.format && value !== undefined ? column.format(value as string) : String(value || '')}
                              color={roleColor}
                              size="small"
                            />
                          </TableCell>
                        );
                      }
                      
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {column.format && value !== undefined
                            ? column.format(value as string)
                            : String(value || '')}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
            )}
            
            {/* 空行の表示（ページサイズ調整用） */}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={columns.length} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* ページネーション */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredUsers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="表示件数:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
      />
      
      {/* ユーザー削除確認ダイアログ */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          ユーザーを削除しますか？
        </DialogTitle>
        <DialogContent>
          {userToDelete && (
            <>
              <Typography variant="body1" gutterBottom>
                以下のユーザーを削除します：
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>名前:</strong> {userToDelete.name}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>メールアドレス:</strong> {userToDelete.email}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>役割:</strong> {columns.find(col => col.id === 'role')?.format?.(userToDelete.role) || userToDelete.role}
              </Typography>
              <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                この操作は取り消せません。
              </Typography>
              
              {deleteError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {deleteError}
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDeleteDialog} 
            color="inherit"
            disabled={deleteLoading}
          >
            キャンセル
          </Button>
          <Button 
            onClick={handleDeleteUser} 
            color="error" 
            variant="contained"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : null}
          >
            {deleteLoading ? '削除中...' : '削除'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagementTable;