"""empty message

Revision ID: 309592978114
Revises: 2580556fa6df
Create Date: 2016-01-07 16:48:43.808220

"""

# revision identifiers, used by Alembic.
revision = '309592978114'
down_revision = '2580556fa6df'

from alembic import op
import sqlalchemy as sa
import geoalchemy2


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('solar', 'coordinates',
               existing_type=geoalchemy2.types.Geometry(geometry_type=u'POINT'),
               nullable=False)
    op.alter_column('solar', 'project_name',
               existing_type=sa.VARCHAR(length=50),
               nullable=False)
    op.alter_column('solar', 'status',
               existing_type=sa.VARCHAR(length=10),
               nullable=False)
    op.add_column('solar_file', sa.Column('caption', sa.Text(), nullable=True))
    op.alter_column('solar_file', 'file_name',
               existing_type=sa.TEXT(),
               nullable=False)
    op.alter_column('solar_file', 'solar_id',
               existing_type=sa.INTEGER(),
               nullable=False)
    op.alter_column('solar_file', 'type',
               existing_type=sa.TEXT(),
               nullable=False)
    op.drop_column('solar_file', 'description')
    op.alter_column('solar_panels', 'solar_id',
               existing_type=sa.INTEGER(),
               nullable=False)
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('solar_panels', 'solar_id',
               existing_type=sa.INTEGER(),
               nullable=True)
    op.add_column('solar_file', sa.Column('description', sa.TEXT(), autoincrement=False, nullable=True))
    op.alter_column('solar_file', 'type',
               existing_type=sa.TEXT(),
               nullable=True)
    op.alter_column('solar_file', 'solar_id',
               existing_type=sa.INTEGER(),
               nullable=True)
    op.alter_column('solar_file', 'file_name',
               existing_type=sa.TEXT(),
               nullable=True)
    op.drop_column('solar_file', 'caption')
    op.alter_column('solar', 'status',
               existing_type=sa.VARCHAR(length=10),
               nullable=True)
    op.alter_column('solar', 'project_name',
               existing_type=sa.VARCHAR(length=50),
               nullable=True)
    op.alter_column('solar', 'coordinates',
               existing_type=geoalchemy2.types.Geometry(geometry_type=u'POINT'),
               nullable=True)
    ### end Alembic commands ###
