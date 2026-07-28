function AlertMessage({

    type = "success",

    title,

    message,

    onClose,

}) {

    return (

        <div
            className={`alert alert-${type} alert-dismissible fade show shadow`}
        >

            {title && (

                <h5 className="alert-heading">

                    {title}

                </h5>

            )}

            <p className="mb-0">

                {message}

            </p>

            {onClose && (

                <button
                    className="btn-close"
                    onClick={onClose}
                />

            )}

        </div>

    );

}

export default AlertMessage;