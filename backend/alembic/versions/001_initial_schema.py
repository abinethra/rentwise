"""Initial schema migration: creates users, agreements, and clauses tables

Revision ID: 001
Revises: 
Create Date: 2026-10-23 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    # 2. Create agreements table
    op.create_table(
        'agreements',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('filename', sa.String(length=255), nullable=False),
        sa.Column('file_type', sa.String(length=50), nullable=False),
        sa.Column('raw_text', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='extracted'),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.Column('overall_risk', sa.String(length=20), nullable=True),
        sa.Column('missing_protections', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_agreements_id'), 'agreements', ['id'], unique=False)
    op.create_index(op.f('ix_agreements_user_id'), 'agreements', ['user_id'], unique=False)

    # 3. Create clauses table
    op.create_table(
        'clauses',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('agreement_id', sa.Integer(), nullable=False),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=True),
        sa.Column('risk', sa.String(length=20), nullable=True),
        sa.Column('explanation', sa.Text(), nullable=True),
        sa.Column('suggestion', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['agreement_id'], ['agreements.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_clauses_agreement_id'), 'clauses', ['agreement_id'], unique=False)
    op.create_index(op.f('ix_clauses_id'), 'clauses', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_clauses_id'), table_name='clauses')
    op.drop_index(op.f('ix_clauses_agreement_id'), table_name='clauses')
    op.drop_table('clauses')

    op.drop_index(op.f('ix_agreements_user_id'), table_name='agreements')
    op.drop_index(op.f('ix_agreements_id'), table_name='agreements')
    op.drop_table('agreements')

    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
