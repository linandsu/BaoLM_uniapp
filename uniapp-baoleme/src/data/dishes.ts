import type { Dish, Category, UserProfile } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: '热销推荐', icon: 'flame' },
  { id: '2', name: '川湘名菜', icon: 'flameKindling' },
  { id: '3', name: '快餐简餐', icon: 'utensils' },
  { id: '4', name: '甜品饮品', icon: 'cupSoda' },
  { id: '5', name: '健康轻食', icon: 'salad' },
];

export const DEFAULT_DISHES: Dish[] = [
  {
    id: 'd1',
    name: '招牌黄焖鸡米饭',
    price: 22,
    description: '精选嫩滑鸡腿肉，搭配香菇、青椒与秘制酱汁，微火慢炖，汤浓肉香。',
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&fit=crop&q=80',
    category: '热销推荐',
    sales: 1250,
    stock: 99,
    status: 'active',
  },
  {
    id: 'd2',
    name: '经典麻婆豆腐',
    price: 15,
    description: '麻辣鲜香、细嫩有味。正宗四川风味，豆腐入口即化，超级下饭。',
    image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=600&auto=format&fit=crop&q=80',
    category: '川湘名菜',
    sales: 852,
    stock: 120,
    status: 'active',
  },
  {
    id: 'd3',
    name: '老成都回锅肉',
    price: 28,
    description: '五花肉切薄片，加入郫县豆瓣、豆豉与鲜蒜苗爆炒，肥而不腻，酱香四溢。',
    image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=600&auto=format&fit=crop&q=80',
    category: '川湘名菜',
    sales: 641,
    stock: 50,
    status: 'active',
  },
  {
    id: 'd4',
    name: '宫保鸡丁',
    price: 24,
    description: '鸡胸肉搭配松脆花生与干辣椒爆炒，微甜微辣微酸，口感极具层次。',
    image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&auto=format&fit=crop&q=80',
    category: '热销推荐',
    sales: 932,
    stock: 80,
    status: 'active',
  },
  {
    id: 'd5',
    name: '经典牛肉汉堡配薯条',
    price: 32,
    description: '手工打制纯牛肉饼，外焦里嫩多汁，搭配新鲜生菜、番茄、起司，附带现炸黄金薯条。',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    category: '快餐简餐',
    sales: 420,
    stock: 45,
    status: 'active',
  },
  {
    id: 'd6',
    name: '清爽牛油果鸡肉沙拉',
    price: 29,
    description: '鲜嫩煎鸡胸肉配熟透牛油果、圣女果、紫甘蓝、混合生菜，配以低卡日式油醋汁。',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
    category: '健康轻食',
    sales: 215,
    stock: 30,
    status: 'active',
  },
  {
    id: 'd7',
    name: '手工黑糖珍珠奶茶',
    price: 14,
    description: '精选高山红茶与鲜牛乳，搭配每日现熬Q弹黑糖黄金珍珠，醇香丝滑，甜度可选。',
    image: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=600&auto=format&fit=crop&q=80',
    category: '甜品饮品',
    sales: 1980,
    stock: 200,
    status: 'active',
  },
  {
    id: 'd8',
    name: '芝士厚乳草莓大福',
    price: 16,
    description: '软糯冰皮包裹浓郁海盐芝士厚乳和一整颗新鲜红草莓，微甜带咸，清爽解腻。',
    image: 'https://images.unsplash.com/photo-1614707267537-b85acf00c4b8?w=600&auto=format&fit=crop&q=80',
    category: '甜品饮品',
    sales: 580,
    stock: 60,
    status: 'active',
  }
];

export const MOCK_USER_PROFILES: UserProfile[] = [
  {
    id: 'u1',
    name: '王小明 (加班狂人)',
    tags: ['熬夜加班', '偏爱重口味', '快捷简餐', '日常催单', '预算20-40元'],
    historyOrdersCount: 24,
    favoriteCategory: '川湘名菜',
    phone: '13888888888',
    address: '北京市中关村科技园A座15层',
  },
  {
    id: 'u2',
    name: '李华 (健身美体派)',
    tags: ['健康轻食', '控糖控油', '高蛋白', '甜品终结者', '偶尔享用无糖奶茶'],
    historyOrdersCount: 15,
    favoriteCategory: '健康轻食',
    phone: '13766666666',
    address: '北京市朝阳区健身中心附近',
  },
  {
    id: 'u3',
    name: '赵女士 (温馨两口之家)',
    tags: ['川湘名菜', '精致餐点', '注重卫生', '喜欢吃鸡肉', '周末加餐'],
    historyOrdersCount: 38,
    favoriteCategory: '热销推荐',
    phone: '13500000000',
    address: '北京市西城区温馨家园小区8号楼',
  }
];

export const MYSQL_DDL_SCHEMA = `-- =====================================================================
-- "饱了么" 外卖平台 课程设计数据库表结构设计 (MySQL / SSM架构适用)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS \`baoleme\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE \`baoleme\`;

-- 1. 用户表 (C端普通用户)
CREATE TABLE IF NOT EXISTS \`tb_user\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  \`username\` VARCHAR(50) NOT NULL UNIQUE COMMENT '登录用户名',
  \`password\` VARCHAR(100) NOT NULL COMMENT '登录密码(MD5或BCrypt加密)',
  \`nickname\` VARCHAR(50) DEFAULT NULL COMMENT '用户昵称',
  \`phone\` VARCHAR(15) DEFAULT NULL COMMENT '联系电话',
  \`address\` VARCHAR(255) DEFAULT NULL COMMENT '默认送餐地址',
  \`user_tags\` VARCHAR(255) DEFAULT NULL COMMENT '用户偏好标签(JSON或逗号分隔)',
  \`created_time\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  \`updated_time\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 2. 商家管理员表 (B端管理员)
CREATE TABLE IF NOT EXISTS \`tb_admin\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY COMMENT '管理员ID',
  \`username\` VARCHAR(50) NOT NULL UNIQUE COMMENT '登录账号',
  \`password\` VARCHAR(100) NOT NULL COMMENT '密码',
  \`role\` VARCHAR(20) DEFAULT 'merchant' COMMENT '角色权限(merchant / super_admin)',
  \`shop_name\` VARCHAR(100) DEFAULT '饱了么自营店' COMMENT '店铺名称',
  \`created_time\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商家管理员表';

-- 3. 菜品分类表
CREATE TABLE IF NOT EXISTS \`tb_category\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
  \`name\` VARCHAR(50) NOT NULL UNIQUE COMMENT '分类名称(如: 川湘名菜、甜品饮品)',
  \`icon\` VARCHAR(50) DEFAULT NULL COMMENT '分类图标名称',
  \`sort_order\` INT DEFAULT 0 COMMENT '排序权重',
  \`created_time\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜品分类表';

-- 4. 菜品表 (上架商品)
CREATE TABLE IF NOT EXISTS \`tb_dish\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY COMMENT '菜品ID',
  \`name\` VARCHAR(100) NOT NULL COMMENT '菜品名称',
  \`price\` DECIMAL(10, 2) NOT NULL COMMENT '菜品单价',
  \`description\` TEXT COMMENT '菜品描述',
  \`image_url\` VARCHAR(255) DEFAULT NULL COMMENT '菜品图HTTP地址(须<=255字符，勿存Base64；大图请走上传接口)',
  \`category_id\` INT NOT NULL COMMENT '所属分类ID (外键关联 tb_category)',
  \`stock\` INT DEFAULT 99 COMMENT '库存剩余',
  \`sales\` INT DEFAULT 0 COMMENT '月销量统计',
  \`status\` TINYINT DEFAULT 1 COMMENT '上架状态 1-上架, 0-下架',
  \`created_time\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_time\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_dish_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`tb_category\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜品详情表';

-- 5. 订单主表
CREATE TABLE IF NOT EXISTS \`tb_order\` (
  \`id\` VARCHAR(64) PRIMARY KEY COMMENT '订单流水号(UUID或雪花算法)',
  \`user_id\` INT NOT NULL COMMENT '下单用户ID (外键关联 tb_user)',
  \`total_price\` DECIMAL(10, 2) NOT NULL COMMENT '订单总实付金额',
  \`status\` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '状态: pending/accepted/cooking/delivering/completed/cancelled',
  \`consignee_phone\` VARCHAR(15) NOT NULL COMMENT '收货人手机号',
  \`delivery_address\` VARCHAR(255) NOT NULL COMMENT '配送地址',
  \`remark\` VARCHAR(255) DEFAULT NULL COMMENT '客户备注留言',
  \`created_time\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '下单时间',
  CONSTRAINT \`fk_order_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`tb_user\` (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单主表';

-- 6. 订单明细表
CREATE TABLE IF NOT EXISTS \`tb_order_detail\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY COMMENT '明细主键ID',
  \`order_id\` VARCHAR(64) NOT NULL COMMENT '所属订单ID',
  \`dish_id\` INT NOT NULL COMMENT '菜品ID',
  \`dish_name\` VARCHAR(100) NOT NULL COMMENT '购买时的菜品快照名称',
  \`price\` DECIMAL(10, 2) NOT NULL COMMENT '购买时的菜品快照价格',
  \`quantity\` INT NOT NULL DEFAULT 1 COMMENT '购买数量',
  CONSTRAINT \`fk_detail_order\` FOREIGN KEY (\`order_id\`) REFERENCES \`tb_order\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_detail_dish\` FOREIGN KEY (\`dish_id\`) REFERENCES \`tb_dish\` (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单明细表';

-- 7. 聊天会话表
CREATE TABLE IF NOT EXISTS \`tb_chat_session\` (
  \`id\` VARCHAR(64) PRIMARY KEY COMMENT '会话唯一UUID',
  \`user_id\` INT NOT NULL COMMENT '关联用户ID',
  \`session_mode\` VARCHAR(10) NOT NULL DEFAULT 'bot' COMMENT 'bot-智能客服, human-人工客服',
  \`status\` VARCHAR(10) DEFAULT 'active' COMMENT 'active-活动, resolved-已结单',
  \`last_msg_time\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_chat_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`tb_user\` (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='聊天会话表';

-- 8. 聊天消息记录表
CREATE TABLE IF NOT EXISTS \`tb_chat_message\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY COMMENT '消息记录ID',
  \`session_id\` VARCHAR(64) NOT NULL COMMENT '所属会话ID',
  \`sender_role\` VARCHAR(15) NOT NULL COMMENT 'user/assistant/merchant',
  \`content\` TEXT NOT NULL COMMENT '消息内容',
  \`created_time\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_msg_session\` FOREIGN KEY (\`session_id\`) REFERENCES \`tb_chat_session\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='聊天消息记录表';`;
