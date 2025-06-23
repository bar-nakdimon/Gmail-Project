import MailActions from './MailActions';
import '../../styles/mails/MailDetail.css';

export default function MailDetail({ mail, userId, onMailDeleted, onMailUpdated }) {
  const labelNames = (mail.labels || []).map(l =>
    typeof l === 'object' ? l.name?.toLowerCase() : String(l).toLowerCase()
  );

  const shouldHideLabels = labelNames.includes('spam') || labelNames.includes('trash');

  return (
    <div className="mail-detail">
      <h1 className="mail-subject-header">{mail.subject}</h1>

      <div className="mail-meta">
        <div><strong>From:</strong> {mail.fromUsername}</div>
        <div><strong>To:</strong> {mail.toUsername}</div>
        <div><strong>Sent:</strong> {new Date(mail.timestamp).toLocaleString()}</div>

        {!shouldHideLabels && (
          <div className="mail-labels">
            <strong>Labels:</strong>
            {(mail.labels || []).length > 0 ? (
              mail.labels.map(label => (
                <span key={label.id || label} className="mail-label-chip">
                  {typeof label === 'object' ? label.name : label}
                </span>
              ))
            ) : (
              <span> None </span>
            )}
          </div>
        )}
      </div>

      <div className="mail-body">{mail.body}</div>

    </div>
  );
}
