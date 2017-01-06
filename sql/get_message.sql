SELECT * 
from message
where  date >= '@date_begin' and date <= '@date_end'
order by time